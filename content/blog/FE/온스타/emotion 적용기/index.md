---
date: 2022-07-11T12:10
title: 프로젝트에 Emotion 적용기
description: 프로젝트에 Emotion을 적용한 이유와 그 과정에 대한 회고와 내용 정리
tags: ["react", "fe", "emotion"]
---

안녕하세요. "함께 사용하는 우리의 공간, 우리가 체크하자!"</br>
GongCheck 팀에서 프론트엔드 개발을 맡고 있는 온스타입니다.</br>
저희 팀은 우아한테크코스 4기 과정에서 공간관리 체크리스트 애플리케이션을 개발하고 있습니다.

리액트 프로젝트를 시작하고, CSS 작성에 대한 고민과 emotion 라이브러리 도입에 대한 이유에 대해 작성한 글입니다.

---

> 💡 우리는 왜 emotion을 선택했는가?

다양한 방식의 CSS 작성법 있고 각 방식마다 장단점이 있으므로,
이번 프로젝트에 들어가기에 앞서 어떤 방식으로 CSS 코드를 작성할지에 대해 먼저 고민했습니다.

이전의 경험에서 **SCSS 문법**의 효용을 느꼈고 이번 프로젝트에서도 SCSS를 사용하고 싶었기 때문에, 이를 지원하지 않는 기본적인 CSS 등은 처음부터 배제하고 생각했습니다.

따라서 SCSS 문법을 지원하는 `CSS in JS` 라이브러리와 `module.scss` 방식 중, 어떤 것 방법을 선택하는 것이 좋을지 먼저 고민하는 시간을 가졌습니다.

### CSS in JS vs module.scss

module.scss 와 CSS 라이브러리 모두 유니크한 클래스 네임을 부여해주어, 클래스 네임에 대한 고민은 하지 않아도 되었습니다.

다만 module.scss에 비해 CSS 라이브러리는 컴포넌트의 상태를 이용한 스타일 분기처리가 가능하여, 상태에 따른 css 코드를 작성하기 수월했고 라이브러리가 제공하는 ThemeProvider를 이용하면 css 변수 처리도 수월했습니다.

하지만, CSS 라이브러리에서 스타일링을 위해 선언된 컴포넌트와 로직을 갖고있는 컴포넌트와의 구분이 쉽지 않아 해당 컴포넌트가 단순한 엘리먼트인지, 로직을 갖고있는 컴포넌트인지 파악하기 힘들었습니다.

## 풀리지 않은 고민

이에 따라 상태에 따른 스타일링이 보다 손쉬운 CSS in JS 라이브러리를 사용하기로 결정했습니다.

다만, 라이브러리의 스타일링을 위해 선언된 컴포넌트와 일반 컴포넌트를 하나의 jsx 내부에서 사용해야 된다는 점이 계속 마음에 걸렸습니다.

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

역할을 가진 컴포넌트와 구분이 안되어서 아래와 같이 prefix를 붙이기도 하는데, 이 방식보다도 좀 더 코드 레벨에서 한 눈에 코드가 들어왔으면 좋겠다는 니즈가 있었습니다.

---

## styled-compoents vs emotion

CSS in JS 방식으로 CSS를 작성하기로하였다고해서 고민이 끝난 것은 아니었습니다. CSS in JS 방식을 대표하는 두 가지 라이브러리 `styled-compoents`와 `emotion` 중 어떤 것을 선택해야 하는가였습니다.

그 이유는 emotion이 가지고 있는 장점들이 조금 더 명확해보여 emotion을 사용하자는 결론이 났는데, 그 이유는 다음과 같습니다.

`emotion`은 크리티컬할 만큼은 아니지만 라이브러리의 사이즈가 styled-components 보다 작았으며 SSR에 대한 별도의 처리가 필요 없었습니다.

하지만 무엇보다 매력적이었던 포인트는 emotion의 `css prop` 기능이 styled-components 컴포넌트보다 필요한 코드 주입의 자동화가 잘 되어있다는 것입니다.

styled-components는 emotion과 달리 매번 css prop을 사용할 때마다 css가 컴파일이 되기 위해 `import styled from 'styled-components/macro'` 를 가져와야 했으며, babel의 설정으로도 자동으로 주입할 수 없었습니다.

### css prop?

```jsx
//emotion

<div
  css={css`
    color: blue;
  `}
>
  text color is blue
</div>
```

라이브러리가 제공해주는 기능 중 하나로 inline style과 유사하게 작성되지만, class로 변환되어 스타일링이 적용됩니다.

이 기능을 이용하면 css 코드를 따로 뺀 뒤 module.scss 처럼 사용할 수 있습니다.

```jsx
<div css={styles.blueColor}>
  text color is blue
</div>
...
const blueColor = css`
  color: blue;
`;
```

emotion의 css prop을 사용하면 지속적인 고민거리였던 컴포넌트로 스타일리을 하는 방식의 단점을 보완할 수도있으며, 다른 니즈를 모두 충족시켜줄 수 있는 방법이었습니다.

---

## pragma?

emotion의 css prop을 제대로 사용하기위해서는 파일 상단에 pragma 선언해 주어야합니다.
`pragma`란 컴파일러에게하는 전처리 명령이라 생각하면 되는데,

`/** @jsx jsx */` 를 통해 컴파일 전처리 단계에서 jsx 문법들을 React.createElement 대신 jsx로 해석해야 css prop이 정상적으로 작동하기 때문입니다.

하지만, 프로젝트에서는 `/** @jsx jsx */` 를 선언해주어도 css props을 제대로 사용할 수 없었는데, 그 이유는 @babel/preset-react의 runtime: "automatic" 옵션을 켜주었기 때문입니다. (CRA v4 이후와 같은 환경)

```jsx
import React from "react"
```

위와 같은 문법이 필요없도록하는 [리액트: 새로운 jsx 변환](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)을 이용했을 시,

`/** @jsxImportSource @emotion/react */`
를 선언해주어야 비로소 jsx 파일이 css prop을 읽을 수 있게 됩니다.

[emotion css prop](https://emotion.sh/docs/css-prop#babel-preset)

[babel: 새로운 jsx 변환](https://babeljs.io/blog/2020/03/16/7.9.0#a-new-jsx-transform-11154httpsgithubcombabelbabelpull11154)

---

## pragma 지우기

css prop을 통해 CSS 코드를 작성하니, 가독성이 훨씬 좋을 뿐더러, 필요한 경우 인라인 스타일링을 할 수 도 있었습니다.

다만, 지속적으로 pragma를 작성하다보니 피로감이 들기 시작했습니다.

`@emotion/babel-preset-css-prop` 같은 babel 플러그인으로 해결할 수 있을까 해서 적용해보았지만 해당 플러그인은 `/** @jsx jsx */` 구문에 대한 해결 방법이었고,

`/** @jsxImportSource @emotion/react */` pragma를 제거하기 위해서는 @babel/preset-react 의 importSource 옵션을 @emotion/react 로 명시적으로 변경해주면 됩니다.

앞의 내용들에 대한 babel.config.json 설정은 다음과 같습니다.

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

해당 설정을 통해 pragma 선언 없이도 emotion의 css prop을 사용할 수 있게 되었습니다.

---

공책팀은 emotion의 css prop 기능을 이용해 CSS 작성을 하고있으며, 해당 스타일링 방식을 통해 빠른 개발을 이어나가고 있습니다.