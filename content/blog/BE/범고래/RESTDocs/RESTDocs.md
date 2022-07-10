---
date: 2022-07-10
title: 공책 팀의 REST Docs
description: 공책 팀이 REST Docs를 도입할 때 고민했던 내용을 정리했습니다.
tags: ["java", "spring", "REST Docs", "단위 테스트", "통합 테스트"]
---

## REST Docs란?

> 테스트 코드를 기반으로 API 문서를 만들어주는 도구입니다.
> Asccidoctor를 사용해서 다양한 포맷으로 문서를 자동으로 생성해줍니다.
> 테스트 코드를 기반으로 문서화를 해주기 때문에, 테스트 코드로 검증된 문서라는 것을 보장할 수 있습니다.

## REST Docs로 어떤 테스트를 해야 하는가?

> REST Docs를 통해 테스트 하는 방식은 RestAssured, MockMvc, WebClient 등 다양한 방식으로 구상할 수 있습니다.
> 어떤 방식으로 테스트하여 만들지는 팀원들과 합의 하에 정하면 됩니다.

## 공책 팀은 REST Docs를 어떻게 사용했는가?

공책 팀은 테스트 단위를 다음과 같이 구상했습니다.

>Domain 테스트  
>Repository Layer 테스트  
>Service Layer 테스트
>`Acceptance 테스트`  
>`Documetation 테스트`  

Domain, Service, Repository의 테스트는 크게 고민하지 않고 진행했습니다.
하지만 Documetation(REST Docs), Acceptance 테스트부터는 팀원과의 협의가 필요했는데요!
각각 어디까지 테스트를 할 것인지, 그에 대한 타당한 이유는 무엇인지 서로 의견을 공유하여 결정했습니다.
저희 팀은 Documetation에서 Controller단의 슬라이스 테스트를 위해 Service는 Mocking한 후, Controller 단의 성공과 실패 케이스를 테스트하여 문서화했습니다.

### Q. 인수 테스트에서 어차피 Controller 테스트가 포함되지 않나요?

물론 좀 더 큰 단위의 테스트(ex. AcceptanceTest)에서 작은 단위의 테스트(ex. Controller Test)가 포함될 수는 있습니다. 하지만 포함된다고 해서 작은 단위의 테스트를 하지 않는다면, 큰
단위의 테스트에서 문제가 발생했을 때 어느 부분에서 문제가 발생했는지 찾기 어렵습니다. 또한 Controller의 실패 케이스(ex. RequestBody에 관한 Valid 테스트)는 인수 테스트에서 진행하기엔 하나의 Acceptance 테스트에 너무 많은 케이스가 존재하여 가독성 또한 떨어진다고 판단했습니다. 
이러한 이유들로 Documentation에서 Controller의 실패 성공에 대한 슬라이스 테스트하기로 결정했습니다.

### Q. Documentation 테스트랑 Controller Test랑 합치면 안되나요?

이 부분은 어디까지 문서화를 시킬 것이냐에 대한 고민이 필요할 것 같은데요. 저희 팀은 실패 케이스는 제외하고 성공 케이스만 문서화를 하는 것이 가독성 측면에서 더 좋다는 판단하에 결정했습니다. 또한 실패 케이스에 대해서까지
문서화가 필요하진 않을 것 같다는 의견도 존재했습니다.

### Q. 왜 SpringBootTest를 사용하지 않고 WebMvcTest를 사용했나요?

Controller 테스트가 Acceptance 테스트에 존재하지만, Controller만 독립적으로 테스트하려고 했던 이유(Service, domain 등 까지 전부 협력해서 테스트를 하면, 문제 발생 시 오류를 찾기 어렵기
떄문에)로 슬라이스 테스트를 하기로 했습니다.
Controller Layer를 독립적으로 테스트하기 위해 Mockito를 사용했기 때문에, 모든 빈들까지 등록해서 테스트할 필요는 없었는데요. 테스트도 어찌보면 적지 않은 비용이 들어가고, 테스트를 돌리는데 들어가는
시간도 그 비용에 속하기 때문에 최대한 줄이려 했습니다.
이런 이유들로 `@WebMvcTest`를 사용해서 필요한 빈들만 관리하고, Controller의 독립적인 테스트를 하기 위해 필요한 Service 빈들은 Mocking을 해주게 되었습니.


### 빌드 구성

```groovy
plugins {
    id 'org.springframework.boot' verstion '2.6.9'
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    id 'org.asciidoctor.convert' version '1.5.8' // asciidoctor 플러그인을 적용하는 것이다. HTMl, PDF 등을 포함한 다양한 형식으로 Asciidoctor 문서를 번약하기 위한 플러그인이다.
    id 'java'
}

group = 'com.woowacourse'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

ext {
    set('snippetsDir', file("build/generated-snippets")) // 아래에서 snippetsDir라는 변수를 사용하게 되는데, 이 변수를 선언하는 것이다.
}

dependencies {
    // spring
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'

    // database-driver
    runtimeOnly 'com.h2database:h2'

    // lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // jwt
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'

    // rest-assured
    testImplementation 'io.rest-assured:rest-assured:4.4.0'
    testImplementation 'io.rest-assured:spring-mock-mvc:4.4.0'

    // rest-docs
    asciidoctor 'org.springframework.restdocs:spring-restdocs-asciidoctor:2.0.5.RELEASE'
    testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'
    testImplementation 'org.springframework.restdocs:spring-restdocs-restassured'
    // build/generated-snippets에 생긴 adoc들을 모아서 .adoc파일에서 읽어들일 수 있도록 연동해준다. 이를 통해 최종적으로 .adoc 파일을 HTML로 만들어 export해준다.
    // `testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'`은  RestDocs를 사용할 때 mockMVC를 통해서 하기 위해 필요한 것이다. 만약 테스트를 MockMVC로 하지 않고, *`restassured`로 하고 싶다면 다른 것을 선언하면 된다.*
}

tasks.named('test') {
    outputs.dir snippetsDir // .adoc파일을 아까 작성한 scippetsDir 변수 값인 "build/generated-snippets"에 output으로 구성하는 설정이다.
    useJUnitPlatform()
} 

tasks.named('asciidoctor') {
    inputs.dir snippetsDir // .adoc파일을 아까 작성한 scippetsDir 변수 값인 "build/generated-snippets"에 input으로 구성하는 설정이다.
    dependsOn test
}

task createDocument(type: Copy) {
    dependsOn asciidoctor

    from file("build/asciidoc/html5/index.html")
    into file("src/main/resources/static")
    // 위에 선언한 `tasks.named('asciidoctor'), tasks.named('test')` 를 실행한 후, `"build/asciidoc/html5/index.html"` 의 파일을 `src/main/resources/static` 경로로 옮겨 서버에 접속해서 볼 수 있는 형태로 바꿔준다.
}

bootJar {
    dependsOn createDocument
}
```

## 테스트 구성

Documentation에 @WebMvcTest를 붙이고, 그 안에 사용되는 Controller를 등록했습니다.
또한 필요한 Service빈들을 Mocking하여 Controller의 성공 케이스만 추가해 문서화했다. 현재 공책은 `MockMvcRequestSpecification` 을
사용한 슬라이스 테스트를 했지만, [링크](https://docs.spring.io/spring-restdocs/docs/current/reference/html5/)를 참고해서 현재 팀에 맞는 방식을 적용해 보면 될 것 같습니다.
