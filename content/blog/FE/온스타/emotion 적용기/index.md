---
date: 2022-07-11T12:10
title: 프로젝트에 Emotion 적용기
description: 프로젝트에 Emotion을 적용한 이유와 그 과정에 대한 회고와 내용 정리
tags: ["react", "fe", "emotion"]
---

<div align="center">
	<img src="https://raw.githubusercontent.com/emotion-js/emotion/main/emotion.png" width="240"/>
</div>

> 💡 왜 emotion을 선택했는가?

다양한 방식의 CSS 작성법 있고 각 방식마다 장단점이 있으므로,
이번 프로젝트에 들어가기에 앞서 어떤 방식으로 CSS 코드를 작성할지에 대해 먼저 고민했다.

이전의 경험에서 **SCSS 문법**의 효용을 느꼈고 이번 프로젝트에서도 SCSS를 사용하고 싶었기 때문에, 이를 지원하지 않는 기본적인 CSS 등은 처음부터 배제되었다.

따라서 SCSS 문법을 지원하는 `CSS in JS` 라이브러리와 `module.scss` 방식 중, 어떤 것 방법을 선택하는 것이 좋을지 먼저 생각해보았다.

---

## CSS in JS vs module.scss

### CSS in JS

#### 장점

- 이전 프로젝트에서 사용해보았기 때문에 익숙하다.
- **ThemeProvider**를 이용해 Theme 관리에 쉽다.
- CSS in JS의 장점을 사용할 수 있다.
- 컴포넌트의 함수와 상수의 공유
- 유니크한 클래스 네이밍 덕분에 클래스 네임 중복에 대한 고민을 피할 수 있다.
  - 스타일드 컴포넌트의 props를 이용해 분기처리가 용이하다.

#### 단점

- 스타일을 가진 컴포넌트를 선언하고 사용하면서 실제 비지니스 로직을 갖고있는 컴포넌트와의 구분이 쉽지 않아 가독성이 떨어진다.
- 위와 같은 문제를 해결하기 위해 Styled, S 같은 prefix를 붙이기도 하지만 가독성에는 큰 도움이 되지 않았다.
- 컴포넌트로 나뉘어져 어떤 엘리먼트 요소인지 확인하기 쉽지 않다.

### module.scss

#### 장점

- 중첩을 생각하지 않고 class 이름을 지을 수 있다.
- 비교적 쉽게 네이밍이 가능하다.
- 어떤 엘리먼트 요소인지 쉽게 알 수 있다.
- className으로만 스타일을 처리하기때문에 가독성이 용이하다.

#### 단점

- 앞서 언급한 CSS in JS 의 장점을 사용할 수 없다.
- 결국 객체로 불러와 className에 넣어주기때문에 여러 className이 중첩될 경우 코드가 길어질 수 있다.
- 조건별 스타일링 분기처리가 힘들다.

---

## 풀리지 않은 고민

위와 같은 고민의 결과로 우리는 CSS in JS를 선택하기로했다.
프로젝트에서 유저와 상호작용이 많을 것으로 예상이 되는데, 조건부 스타일링을 className으로만 하기에는 코드의 가독성이 너무 떨어질 것 같았기때문이다.

다만, styled를 이용한 스타일링의 단점이 계속 마음에 걸리긴했다.

```jsx
<PostContainer>
  <Post />
</PostContainer>

const PostConatiner = styled.div``
```

```jsx
<Styled.PostContainer>
  <Post />
</Styled.PostContainer>

const PostConatiner = styled.div``
```

역할을 가진 컴포넌트와 구분이 안되어서 아래와 같이 prefix를 붙이기도 하는데, 이 방식보다도 좀 더 코드 레벨에서 한 눈에 코드가 들어왔으면 좋겠다는 생각이 있었다.

---

## styled-compoents vs emotion

CSS in JS 방식으로 CSS를 작성하기로하였다고해서 고민이 끝난 것은 아니었다. CSS in JS 방식을 대표하는 두 가지 라이브러리 `styled-compoents`와 `emotion` 중 어떤 것을 선택해야 하는가였다.

이전 프로젝트에서 대부분 styled-componets를 썼었지만, emotion을 쓰자는 것으로 의견이 기울어졌는데, 그 이유는 emotion이 가지고 있는 장점들이 조금 더 명확해보였기 때문이다.

`emotion`은 크리티컬할 만큼은 아니지만 라이브러리의 사이즈가 styled-components 보다 작았으며 SSR에 대한 별도의 처리가 필요없었다.
하지만 무엇보다 매력적이었던 포인트는 `css prop` 기능을 지원한다는 것이었다.

### css prop?

```jsx
<div
  css={css`
    color: blue;
  `}
>
  text color is blue
</div>
```

emotion에서 제공해주는 기능 중 하나로 inline style과 유사하게 작성되지만, class로 변환되어 스타일링이 적용된다.

이 기능을 이용하면 css 코드를 따로 뺀 뒤 module.scss 처럼 사용할 수 있다.

```jsx
<div css={styles.blueColor}>
  text color is blue
</div>
...
const blueColor = css`
  color: blue;
`;
```

emotion의 css prop을 사용하면 지속적인 고민거리였던 컴포넌트로 스타일리을 하는 방식의 단점을 보완할 수도있으며, 다른 니즈를 모두 충족시켜줄 수 있는 방법이었다.

다만, 해당 방식을 사용하기 위해서는 모든 jsx 파일 상단에 `pragma`를 선언해줘야한다는 단점이 있었다.

---

## pragma?

emotion의 css prop을 제대로 사용하기위해서는 파일 상단에 pragma 선언해 주어야한다.
`pragma`란 컴파일러에게하는 전처리 명령이라 생각하면 되는데,

`/** @jsx jsx */` 를 통해 컴파일 전처리 단계에서 jsx 문법들을 React.createElement 대신 jsx로 해석해야 css prop이 정상적으로 작동하기 때문이다.

하지만, 프로젝트에서는 `/** @jsx jsx */` 를 선언해주어도 css props을 제대로 사용할 수 없었는데, 그 이유는 @babel/preset-react의 runtime: "automatic" 옵션을 켜주었기 때문이다. (CRA v4 이후와 같은 환경)

```jsx
import React from "react"
```

위와 같은 문법이 필요없도록하는 [리액트: 새로운 jsx 변환](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)을 이용했을 시,

`/** @jsxImportSource @emotion/react */`
를 선언해주어야 비로소 jsx 파일이 css prop을 읽을 수 있게 된다.

[emotion css prop](https://emotion.sh/docs/css-prop#babel-preset)

[babel: 새로운 jsx 변환](https://babeljs.io/blog/2020/03/16/7.9.0#a-new-jsx-transform-11154httpsgithubcombabelbabelpull11154)

---

## pragma 지우기

css prop을 통해 CSS 코드를 작성하니, 가독성이 훨씬 좋을 뿐더러, 필요한 경우 인라인 스타일링을 할 수 도 있었다.

다만, 지속적으로 pragma를 작성하다보니 피로감이 들기시작했다.

`@emotion/babel-preset-css-prop` 같은 babel 플러그인으로 해결할 수 있을까 해서 적용해보았지만 해당 플러그인은 `/** @jsx jsx */` 구문에 대한 해결 방법인듯했다.

`/** @jsxImportSource @emotion/react */` pragma를 제거하기 위해서는 @babel/preset-react 의 importSource 옵션을 @emotion/react 로 명시적으로 변경해주면 된다.

앞의 내용들에 대한 babel.config.json 설정은 다음과 같다.

```json
{
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "automatic", "importSource": "@emotion/react" }],
    "@babel/preset-typescript"
  ],
  ...
}
```

해당 설정을 통해 pragma 선언 없이도 emotion의 css prop을 사용할 수 있게 되었다.

---

우리는 emotion의 css prop 기능을 이용해 CSS 작성을 하고있으며, 해당 방식에 만족하고있다. 다만, emotion의 ThemeProvider를 사용하지 못하는 것과 조건부 스타일링에 관한 것은 styled에 비해 아쉽기도하다.
