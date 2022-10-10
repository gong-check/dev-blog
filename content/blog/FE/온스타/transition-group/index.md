---
date: 2022-10-10T23:10
title: React Transition Group 도입기
description: 프로젝트에 React Transition Group 적용한 이유와 그 과정에 대한 회고와 내용 정리
tags: ["react", "fe", "transition"]
---

안녕하세요. "함께 사용하는 우리의 공간, 우리가 체크하자!"</br>
GongCheck 팀에서 프론트엔드 개발을 맡고 있는 온스타입니다.</br>
저희 팀은 우아한테크코스 4기 과정에서 공간관리 체크리스트 애플리케이션을 개발하고 있습니다.

저희 GongCheck 프로젝트에는 페이지 전환 애니메이션이 적용되어있는데, 이를 위해 react-transition-group 을 이용하였습니다. 

페이지 전환 애니메이션과 react-transition-group 도입에 있어서 어떤 고민의 과정을 거쳤는지에 대한 글입니다.

---
> 우리는 react-transition-group 이 왜 필요했고, 어떻게 도입했는가?

### 페이지 전환 애니메이션이 왜 필요했을까?

현재 GongCheck 프로젝트에 적용되어있는 페이지 전환 애니메이션입니다.

<img src="image/first.webp" width="280"/>

GongCheck 프로젝트는 위의 영상에서 보이는 공간 사용자를 위한 사이트와, 또 다른 공간 관리자를 위한 사이트가 분리되어있습니다.

GongCheck의 공간 사용자를 위한 페이지에만 페이지 전환 애니메이션이 적용되어있는데, 그 이유는 다음과 같습니다.

'우아한테크코스'라는 관리자는 '잠실 캠퍼스'와 '선릉 캠퍼스'라는 두 개의 공간을 가지고 있고, 각 캠퍼스는 '청소'와 '마감'이라는 업무를 가지고 있죠. 
지금은 두 개의 공간과 각 공간당 두 개의 업무뿐이지만 업무가 더 늘어난다면 사용자가 원하는 업무에 들어가기 위해 고려해야 할 사항이 점점 늘어납니다.

`사용자가 내가 지금 어떤 장소 페이지에서 어떤 상호작용을 하고 있는지, 페이지 애니메이션을 통해 지속해서 확인`할 수 있도록 도와주는 것이죠. 

이러한 이유로 미묘한 차이지만 '공간 목록에서 업무 목록으로의 페이지 전환 애니메이션'과 '업무 목록에서 체크리스트 페이지로의 페이지 전환 애니메이션'은 다르게 해놓았습니다.

이뿐만 아니라 좀 더 다양한 작업과 인터렉션이 있어야 하는 관리자 사이트와는 다르게 공간 사용자를 위한 사이트는 목적이 단순하고 명확합니다. 

"사용자는 원하는 공간의 체크리스트를 찾고, 체크리스트에 체크할 수 있어야 한다."

사이트의 목적이 단순하고 명확하다는 것은 '사용자가 할 수 있는 일이 적다'라고도 이해할 수 있는데, 이때 사용자에게 단순한 유저의 경험까지 제공한다면 사용자에겐 이용하고 싶지 않은 매력이 없는 사이트가 될 수도 있겠죠. 때문에 `사용자 경험의 향상`을 위해 사용자가 확실하게 느낄 수 있는 페이지 애니메이션을 적용했습니다.


## react-transition-group?
react-transition-group는 react-motion, framer-motion 같은 애니메이션 라이브러리가 아닙니다.
리액트에서 컴포넌트가 DOM에 마운팅되고 언마운팅되는 상황에 애니메이션을 적용할 수 있도록 도와주는 React 팀이 자체적으로 제공하는 라이브러리입니다.

react-transition-group는 Transition, CSSTransition, SwitchTransition, TransitionGroup 이라는 4개의 컴포넌트를 제공하는데, 이에 대해 가볍게만 살펴보면 다음과 같습니다.

### Transition
컴포넌트의 마운트, 언마운트를 'entering', 'entered', 'exiting', 'exited' 라는 상태를 기반으로 설명하며, 이 상태에 따라 컴포넌트를 조작할 수 있도록 도와주는 컴포넌트입니다. 단, 하나의 컴포넌트에 4가지 전환(transition) 상태만 부여할 뿐이며, 상태 부여에만 관심이 있기 때문에 전화 애니메이션에 대한 CSS를 조작하기 위해서는 이후에 설명할 CSSTransition 컴포넌트를 이용하는 것이 더 자연스럽습니다.

### CSSTransition
Transition 컴포넌트의 모든 속성을 상속하며, 컴포넌트의 마운트, 언마운트 시점을 상태로 관리하며 이에 대한 CSS 효과나 애니메이션을 부여하기 위해 사용됩니다. Transition은 4가지의 상태값으로만 마운트, 언마운트를 상황을 설명하지만, CSSTransition에서는 임의적인 이름을 가진 클래스 이름의 뒤에 마운트, 언마운트 상황을 부여하여, CSS로 더 쉽게 조작할 수 있도록 합니다. 

```js
<CSSTransition nodeRef={nodeRef} in={inProp} timeout={200} classNames="my-node">
    <div ref={nodeRef}>
        {"I'll receive my-node-* classes"}
    </div>
</CSSTransition>
```
CSSTransition으로 묶인 컴포넌트가 마운트, 언마운트되는 상황은 my-node-enter, my-node-enter-active, my-node-exit, my-node-exit-active 의 상황으로 표현될 것이고, 이 클래스들의 이름을 이용하여 CSS를 작성하면, 전환 애니메이션을 쉽게 조작할 수 있습니다.

### SwitchTransition
Transition 또는 CSSTransition을 하위 컴포넌트로 가지는데, 상태 변화에 따라 기존의 컴포넌트가 언마운트되고 새롭게 마운트된다면 그 상태 전환 사이의 렌더링을 제어합니다.
'out-in', 'in-out'으로 이루어진 두 가지 모드를 가지고 마운트, 언마운트 시점을 조작합니다. mode가 out-in일 경우, 현재 요소가 먼저 전환된 다음 완료되면 새 요소가 전환됩니다. mode가 in-out일 경우 새 요소가 먼저 전환된 다음 완료되면 현재 요소가 전환됩니다.


### TransitionGroup
SwitchTransition과 마찬가지로, 상태 변화에 따라 컴포넌트가 마운트되고, 언마운트될 떄 그 상태 전환 사이의 렌더링을 조작할 수 있게합니다. 다만, 마운트 대상, 언마운트 대상을 직접 기억하고 관리하며, 애니메이션을 동시에 발생시킬 수 있도록합니다. 다만, 마운트, 언마운트될 대상 컴포넌트를 각각의 key로 관리할 수 있어야합니다.

```js
    <TransitionGroup className="todo-list">
          {items.map(({ id, text, nodeRef }) => (
            <CSSTransition
              key={id}
              nodeRef={nodeRef}
              timeout={500}
              classNames="item"
            >
              <ListGroup.Item ref={nodeRef}>
                ...
```

더욱 자세한 설명은 http://reactcommunity.org/react-transition-group/ 에 들어가면 확인할 수 있습니다.

react-transition-group이 제공하는 4가지 컴포넌트에 대해 간략하게 보았는데, 우리는 페이지 전환시의 CSS 조작을 해야했으며, 기존의 페이지와 바뀔 페이지에 대한 애니메이션이 동시적으로 발생해야했습니다.

따라서, 이런 니즈에 따라 CSSTransition 과 TransitionGroup을 묶어서 사용하게되었습니다.


## 공책팀에서 react-transition-group을 사용한 방법
우선, TransitionGroup과 CSSTransition를 묶어서 관리할 수 있는 Transitions라는 컴포넌트를 만들었습니다. 
이때 사용한 childFactory라는 속성은 TransitionGroup이 가지는 속성입니다. 이미 언마운트된 엘리먼트에 대해 접근이 필요한 경우, 리액트의 cloneElement를 통해 엘리먼트를 복제하고, 그에 대해 접근할 수 있도록해주는 속성입니다.

Transitions 컴포넌트는 transition, pageKey, children이라는 props를 받고 있는데, transition은 페이지별 애니메이션을 분기 처리하기 위해 상위 컴포넌트로부터 props로 주입받고 있으며, 이는 useTransitionSelect 라는 훅을 통해 페이지에 필요한 애니메이션 효과를 받아오고 있습니다. useTransitionSelect 훅이 하는 역할과 그 필요에 대해서는 이후에 살펴보겠습니다.

pageKey는 CSSTransition의 key값으로 들어갈 location.pathname의 값입니다. 이 pageKey가 변경될 때(페이지가 전환 될 때) 이전 요소와 새 요소에 대해 애니메이션 효과가 적용되게 됩니다.


```js
// Transitions.tsx

const childFactoryCreator = (props: { classNames: string }) => (child: React.ReactElement) =>
  cloneElement(child, props);

const Transitions: React.FC<TransitionsProps> = ({ transition, pageKey, children }) => (
  <TransitionGroup className="transitions-group" childFactory={childFactoryCreator({ classNames: transition })}>
    <CSSTransition key={pageKey} timeout={500}>
      {children}
    </CSSTransition>
  </TransitionGroup>
);
```
Transitions 컴포넌트가 적용된 라우팅을 불러오는 곳은 다음과 같습니다. Transitions 컴포넌트를 통해 관심사를 분리하였고 useRouts를 통해 라우팅될 페이지를 불러오고있기때문에 상당히 간결한 코드로 페이지 전환 애니메이션과 라우팅을 처리할 수 있게되었습니다.

```js
//App.tsx

 const content = useRoutes(routes, location);
 const transition = useTransitionSelect();

return (
    <Transitions pageKey={location.pathname} transition={transition}>
        {content}
    </Transitions>
```

페이지별 애니메이션 효과 분기를 위한 useTransitionSelect의 내부코드는 다음과 같습니다.

```js
// hooks/useTransitionSelect.ts

const useTransitionSelect = () => {
  const location = useLocation();
  const previousPath = sessionStorage.getItem('path');

  const previousPage = getPageByPath(previousPath || '');
  const currentPage = getPageByPath(location.pathname);

  sessionStorage.setItem('path', location.pathname);

  if (currentPage === 'passwordPage') {
    return '';
  }
  if (currentPage === 'spaceListPage') {
    if (previousPage === 'passwordPage') return '';
    return 'slide-left';
  }
  if (currentPage === 'jobListPage') {
    if (previousPage === 'spaceListPage') {
      return 'slide-right';
    }
    if (previousPage === 'taskListPage') {
      return 'left';
    }
  }
  if (currentPage === 'taskListPage') {
    return 'right';
  }

  return '';
};
```

```js
//styles/transitions.ts

...
// right
  .right-enter {
    z-index: 1;
    transform: translateX(100%);
  }
  .right-enter.right-enter-active {
    z-index: 1;
    transform: translateX(0);
    transition: transform 600ms;
  }
  .right-exit {
    z-index: 0;
    transform: translateX(0);
    transition: transform 600ms;
  }
//...
```

세션 스토리지를 이용해 이전 pathname에 대한 정보를 저장하고, 현재 pathname과 비교하여, 애니메이션이 적용될 클래스 이름을 반환합니다. 아래의 코드처럼 right, left, slide-right 등 필요한 페이지 전환 애니메이션에 대한 css 코드는 한 곳에서 작성하여 보관하고, 필요한 클래스 이름만 반환하면 원하는 곳에서 원하는 페이지 애니메이션이 발생할 수 있게 됩니다.

다만, pathname을 통해 페이지의 이름을 받아오는 로직은 pathname의 'www.gongcheck.day/spaces/1/2'처럼 '/' depth에만 의존을 하고 있는데, 
원래 기존의 방식은 페이지가 전환될 때마다 page 컴포넌트에서 어떤 페이지인지 명시적으로 저장하는 것이었습니다. 
페이지 컴포넌트를 생성할 때마다 어떤 페이지인지 저장한다는 로직을 반복적으로 부여해주었어야 했고, 
페이지 컴포넌트가 애니메이션이라는 것에 의존적으로 필요 없는 로직을 갖게 되는 것이 마음에 들지 않아 현재의 방식으로 이전 페이지, 현재 페이지를 관리하고 있습니다. 이 부분에 대해서는 더 좋은 방법이 있는지 고민을 해볼 수 있겠다고 생각합니다.

### 정리
공책팀은 사용자의 경험과 페이지의 분리를 위해 페이지 전환효과를 공책팀만의 방식으로 적용했습니다. 공식문서에 따라 필요한 속성을 적절히 사용한 컴포넌트를 만들었고, 필요한 props만 넘겨주는 것으로 다른 페이지를 생성하게 되어도 동일한 방식으로 애니메이션을 부여할 수 있게끔 하였습니다. 페이지별 애니메이션 분기 처리에 대해서는 더 합리적인 방식이 있을지 고민 중입니다.

### 참고자료
- http://reactcommunity.org/react-transition-group/
- https://medium.com/onfido-tech/animations-with-react-router-8e97222e25e1
- https://codesandbox.io/s/animated-routes-demo-react-router-v6-6l1li?fontsize=14&hidenavigation=1&theme=dark&file=/src/index.tsx