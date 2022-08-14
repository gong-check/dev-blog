---
date: 2022-08-14T20:55
title: '테스트코드 개선 - 2. 테스트 상황에서의 정확한 격리'
description: '실제 상황과 동일한 환경을 만들기 위한 격리법'
tags: ["테스트 격리"]
---

안녕하세요 공책팀에서 백엔드 개발을 맡고 있는 오리입니다.

지난번에 이어서 테스트코드에 대한 개선기를 이야기하려고합니다.
이번에 이야기할 주제는 "얼마나 실제 환경과 동일한 환경에서 테스트하고 있는가?"입니다.

---

## 지금까지 잘 테스트하고 계신가요?

### Context을 위한 많은 repository

저희 팀에서는 테스트에 대한 Context를 설정하기 위해서 많은 데이터가 필요합니다.

`Host` - `Space` - `Section` - `Job`이 연결되어있기 때문에 `Job`을 위한 테스트를 진행한다라고하면 모든 데이터값이 세팅되어야하죠. 그래서 이전 테스트코드에서는 다음과 같은 풍경을 볼 수 있어요.

```java
// ...

@Autowired
private HostRepository hostRepository;

@Autowired
private SpaceRepository spaceRepository;

@Autowired
private SectionRepository sectionRepository;

@Autowired
private JobRepository jobRepository;
```
너무 난잡하지 않나요? 제가 테스트하고자하는 클래스는 `JobService`뿐인데 너무 많은 dependency를 주입받아야 해요. 무얼 테스트하는지 불투명해지는 거죠.

그렇다고 `@Sql`을 사용하자니 지금 테스트에 사용하고자하는 각각의 테스트 Context에 대해서 명확해야하는데 sql 파일을 일일히 찾아가야하거나 너무 많은 상황에 대한 sql 파일이 생겨 문제가 발생합니다.

### 쿼리의 문제

보통 `@Service`와 `@Respository`를 테스트한다라고 했을 때 저희는 "테스트 격리"를 많이 생각하고는합니다.
대표적인 방법으로는 아래와 같이 `@Transactional`을 다는 것이겠죠. (`@DataJpaTest`는 `@Transactional`을 같이 사용하고 있구요.)

```java

@SpringBootTest
@Transactional
class HostServiceTest {
    // ...
}
```
`@Transactional`을 테스트 클래스단에 달고나면 하위에 잡혀있는 모든 테스트들이 돌아간 이후 rollback을 통해서 다른 테스트에 영향을 미치지 않게 됩니다. 잘못된 방법이라기보다는 대표적으로 사용하는 방법이고 큰 문제가 발생하는 케이스는 잘 없습니다.

근데 문제는 Jpa를 사용하게된다면 다른 위치에서 발생합니다. "영속성" 때문이죠. 다음 예시를 한번 볼까요?

```java
@Nested
class findSpaces_메서드는 {

    @Nested
    class 존재하는_Host의_id를_입력받은_경우 {

        private Host host;
        private SpacesResponse expected;

        @BeforeEach
        void setUp() {
            host = hostRepository.save(Host_생성("1234", 1234L));

            Space space_1 = Space_생성(host, "잠실 캠퍼스");
            Space space_2 = Space_생성(host, "선릉 캠퍼스");
            Space space_3 = Space_생성(host, "양평같은방");
            List<Space> spaces = spaceRepository.saveAll(List.of(space_1, space_2, space_3));

            expected = SpacesResponse.from(spaces);
        }

        @Test
        void 해당_Host가_소유한_Space를_응답으로_반환한다() {
            SpacesResponse actual = spaceService.findSpaces(host.getId());

            assertThat(actual.getSpaces())
                    .usingRecursiveFieldByFieldElementComparator()
                    .isEqualTo(expected.getSpaces());
        }
    }
    }
```
위 테스트는 보유한 `Spaces`를 찾는 기능을 테스트하고 있습니다. 테스트 시에 원하는 테스트값이 들어갔는지 확인을 하기 위해서 `setUp`에서는 데이터를 미리 넣는 것을 볼 수 있어요.

뭐가 문제일까?라는 생각을 하게 되지만 실제로 쿼리가 어떻게 날아갈까요? (아래는 실제 날아간 테스트코드에 대해서 정리한 쿼리문입니다.)
- **setup 메소드 시작**
    - host save 메소드로 인한 insert문 1개
    - space saveAll 메소드로 인한 insert문 3개
- **setup 메소드 끝**
- **테스트 메소드 시작**
- **테스트 메소드 끝**

이제는 큰 문제가 보이시나요? 저희가 테스트할 `findSpaces()` 메소드가 쿼리가 실제로 날아가지 않습니다. setup에서 날아간 메소드들에 의해서 영속성 컨텍스트들에 해당 값이 들어가기 때문에 같은 영속성 컨텍스트안에 머물고 있던 테스트 메소드에서도 공유하고 있는거죠. 그래서 `findSpaces()`에서는 쿼리가 날아가지 않습니다.

여기서 하나의 의문을 가지게 될 수 밖에 없습니다.
> 테스트는 격리도 물론 중요하지만 최대한 실제 상황에 맞추어서 테스트하는 것이 중요하다.
> findSpaces()라는 테스트할 행위에 대해서 결과물도 중요하지만 그 과정에서 쿼리가 어떻게 실제로 날아가는지 테스트하는 것도 목적이다.
> 
> 하지만 영속성 컨텍스트로 인하여 "실제" 상황을 대변하지는 못한다. 과연 테스트 상황에 대한 격리가 제대로 되었다고 말할 수 있을까?

그래서 저희 팀에서는 이를 해결하고자 하나의 특수 클래스를 통해 Context를 설정하는 방향을 잡아보려했어요.

## 테스트 시 실제 상황을 위한 SupportRepository
거두절미하게 먼저 코드부터 보고 이야기를 하겠습니다.

```java
@Component
@Transactional
public class SupportRepository {

    @Autowired
    private EntityManager entityManager;

    public <T> T save(final T entity) {
        entityManager.persist(entity);
        entityManager.flush();
        entityManager.clear();
        return entity;
    }

    public <T> List<T> saveAll(final List<T> entities) {
        for (T entity : entities) {
            save(entity);
        }
        entityManager.flush();
        entityManager.clear();
        return entities;
    }
}
```

사실 거창하게 이야기했지만 해결책은 간단합니다.

> save하는 메소드 실행 후 영속성 컨텍스트를 비운다.

지금 발생한 문제는 "하나의" Transaction안에서 JpaRepository를 상속받은 메소드들을 사용했기 때문에 하나의 영속성 컨텍스트를 공유한다라는 문제가 있어요.
이를 해결하고자 한다면, save메소드 동작 시 flush와 clear를 동시에 진행해주는 거죠. db에 반영함으로써 테스트 데이터는 넣고, clear를 바로해주면서 영속성 컨텍스트로 다음 테스트들이 영향받는것을 막아줍니다.

다만 여러개의 `JpaRepository`를 주입받고있는 상태에서 어떤 타입의 Entity를 주입받을 수는 없으니 `EntityManager`를 사용하여 persist-flush-clear를 동시에 해주는 방식으로 진행해주었습니다.

또한 이로인해 테스트코드에서 수많은 repository를 `@Autowired`하고 있다면 `SupportRepository`만 두어서 대체할 수도 있는거죠.

개선한 이후에는 아래와 같이 명확하게, 그리고 필요한 객체만 주입받도록 변경할 수 있었어요.

```java
@Autowired
private SpaceService spaceService;

@Autowired
private SupportRepository repository;

@Nested
class findSpaces_메서드는 {

    @Nested
    class 존재하는_Host의_id를_입력받은_경우 {

        private Host host;
        private SpacesResponse expected;

        @BeforeEach
        void setUp() {
            host = repository.save(Host_생성("1234", 1234L));

            Space space_1 = Space_생성(host, "잠실 캠퍼스");
            Space space_2 = Space_생성(host, "선릉 캠퍼스");
            Space space_3 = Space_생성(host, "양평같은방");
            List<Space> spaces = repository.saveAll(List.of(space_1, space_2, space_3));

            expected = SpacesResponse.from(spaces);
        }

        @Test
        void 해당_Host가_소유한_Space를_응답으로_반환한다() {
            SpacesResponse actual = spaceService.findSpaces(host.getId());

            assertThat(actual.getSpaces())
                    .usingRecursiveFieldByFieldElementComparator()
                    .isEqualTo(expected.getSpaces());
        }
    }
}
```

## 조금 더 확실하게 분리하기
위와 같은 방법으로 인해서 잘 격리하고있다라고 생각했던 테스트에서 영속성 컨텍스트에 대한 문제까지 격리를 할 수 있었어요.

다만 적용을 하다보니 "실제 상황"에 테스트를 하기위한 고민을 더 하게 되었습니다. 아직까지도 격리가 잘 되고있는 것인가에 대해서 말이죠.

일단 `@Transactional`을 통해서 현재 테스트 메소드가 다음 테스트에 대해서 영향을 미치는 문제에 대해서는 막고 있다라고 생각했어요. setUp과 테스트메소드 모두 현재 테스트가 종료되면 롤백되거든요.

다만 검증의 이야기를 하면 조금 달라져요. 아래의 케이스를 보겠습니다.

```java
@Test
void Job과_관련된_Section_Task_RunningTask를_함께_삭제한다() {
    jobService.removeJob(host.getId(), job.getId());
    entityManager.flush();
    entityManager.clear();

    assertAll(
            () -> assertThat(jobRepository.findById(job.getId())).isEmpty(),
            () -> assertThat(sectionRepository.findById(section.getId())).isEmpty(),
            () -> assertThat(taskRepository.findById(task.getId())).isEmpty(),
            () -> assertThat(runningTaskRepository.findById(runningTask.getTaskId())).isEmpty()
    );
}
```
테스트를 하기 위해서 `removeJob`를 실행하고 실제로 실행되어있는지 find해서 비어있음을 확인하는 테스트입니다.

문제는 이 코드가 왜 `flush`와 `clear`를 동작시켰을까요? 그건 `removeJob`안에 있는 `deleteAllInBatch` 때문입니다. 이문제에 대해서는 상세하게 다루지는 않고 간단하게 이야기드리면 `deleteAllInBatch`는 모든 삭제를 batch로 올리기는 하지만 영속성 컨텍스트에서 삭제된 entity는 반영되지 않습니다. (조금 이상한 구조라고 생각합니다.)

그럼 이제 무엇이 문제인지 보이나요?

> 테스트하고자하는 테스트가 검증하는 메소드에 영향이 갈 수 있다.

그래서 `removeJob`이 다른 검증 메소드에 영향이 끼치지않게 하기 위해서 임의로 entityManager를 호출하고 있는거죠.

이와 같은 동작을 하는 테스트코드들이 여러개 있었고 모든 테스트에 대해서 flush clear를 호출하기는 번거로웠고 그렇다고 특정 문제되는 코드에 대해서 신경쓰기도 힘들었어요.

그럼 문제 해결책은 다시 돌아와서 "실제 상황"을 더 명확하게 만드는 것에 있습니다.

테스트하고자하는 메소드인 `removeJob`에 대해서 본인의 트랜잭션만 부여하고 commit하게끔하면 영속성 컨텍스트를 공유하는 등과 같이 다른 테스트에 영향을 끼치지 않는거죠.

따라서 테스트 격리를 위해서 클래스단에 `@Transactional`을 사용하고 있는 것조차도 문제가 되기 때문에 해당 어노테이션을 지우는 방향으로 도달하였습니다.

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest
@ExtendWith({DatabaseCleanerExtension.class})
public @interface ApplicationTest {
}
```
`DatabaseCleanerExtension`은 저희가 만든 extension으로 `afterEach`로 데이터베이스를 초기화해준다라고 보면 돼요. 해당 어노테이션을 사용하면 `@Transactional`을 함께 사용했을 때와는 다르게 동작하는 "테스트할 행위"가 독립된 트랜잭션으로 돌아가기 때문에 이제는 진짜로 실제 상황과 동일하게 테스트 상황을 만들어줄 수 있게 됩니다.

## 추가적인 유틸 메소드
`Context을 위한 많은 repository`에서도 이야기를 하였지만 사실 `SupportRepository`를 추가한다고 많이 사라지지는 않습니다. 검증을 위한 수많은 `findBy`메소드들 때문이죠.

검증을 하기 위해서 찾게 되는 repository들을 주입하는 것도 귀찮지만 `findBy`로 반화되는 Optional을 처리하기도 사실 귀찮습니다.

따라서 `SupportRepository`에서는 아래와 같은 기능도 제공하고 있어요.
```java
public <T> Optional<T> findById(final Class<T> entityClass, final Object id) {
    entityManager.clear();
    return Optional.ofNullable(entityManager.find(entityClass, id));
}

public <T> T getById(final Class<T> entityClass, final Object id) {
    entityManager.clear();
    return Optional.ofNullable(entityManager.find(entityClass, id))
            .orElseThrow(EntityNotFoundExcpetion::new);
}

static class EntityNotFoundExcpetion extends RuntimeException {

    public EntityNotFoundExcpetion() {
        super("Entity를 찾을 수 없습니다.");
    }
}
```
이전과 동일하게 entityManager를 통해서 찾을 수 있도록 편하게 제공하는거죠. 해당 메소드로 인해서 저희 팀에서는 무수한 repository들을 제거하고 편하게 테스트할 수 있게 되었습니다.

## 한계는 존재합니다.
지금까지 말하고 한계가 존재한다라고하니 웃기기는 하지만 결국 이렇게 repository를 줄이고도 검증단계에서 복잡한 쿼리가 필요하다라면 그때는 repository들이 필요하게 되거든요. 

해결책이라고하면 테스트를 위한 동적 쿼리를 만들어주는 메소드를 만들거나(좀 하드하네요), querydsl을 사용하는거죠(러닝커브가 있습니다).

팀내에서는 지금까지의 방법만으로도 충분하기 때문에 학습에 필요한 러닝커브를 따지기보다는 지금의 구조로 두었지만 검증에 대한 불편함이 있다면 더 도전해보는 것도 좋은 방법일 것 같습니다.


### 참고자료
- https://cheese10yun.github.io/jpa-test-support/
- https://dev-gorany.tistory.com/348
