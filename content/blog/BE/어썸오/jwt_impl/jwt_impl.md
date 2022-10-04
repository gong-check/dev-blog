---
date: 2022-07-11
title: JWT 기반 인증, 인가 구현기
description: 스프링 프로젝트에서 JWT 기반 인증을 구현하는 방법을 다룹니다.
tags: ["spring", "JWT"]
---

안녕하세요. 공책 팀의 어썸오입니다.

공책 프로젝트는 JWT 기반의 인증 방식을 채택했는데요, 이번 포스팅에서는 JWT 기반 인증을 어떻게 구현을 했고 어떤 고민들을 했는지에 대해 이야기 해보도록 하겠습니다.

JWT 인증 방식이 무엇인지에 대해서는 오리가
작성한 [JWT(Json Web Token) 인증방식](https://velog.io/@jinyoungchoi95/JWTJson-Web-Token-%EC%9D%B8%EC%A6%9D%EB%B0%A9%EC%8B%9D)을
참고해주세요.

## 의존성 추가

저희 팀은 [jjwt 라이브러리](https://github.com/jwtk/jjwt)를 사용하기로 결정했습니다. jwt 라이브러리 중 팀원들에게 가장 익숙한 라이브러리였기 때문에 큰 고민없이 선택할 수 있었습니다.

jjwt 라이브러리를 사용하려면 아래와 같은 의존성을 추가해주어야 합니다.

**Gradle**

```groovy
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
```

## 인증

### JwtTokenProvider

우선 토큰을 발급하고, 서버로 넘어온 토큰을 검증 및 해석할 객체가 필요합니다.

토큰을 발급하려면 토큰의 위변조를 확인하는데 사용할 시크릿 키와 토큰의 만료 시간을 설정해야합니다.

시크릿 키로는 [여러 포맷](https://github.com/jwtk/jjwt#jws-create-key)을 사용할 수 있는데 가장 일반적인 방식인 BASE_64 인코딩된 문자열을 사용하는 방식을 사용하겠습니다.

암호화 알고리즘은 SHA-256을 사용할 건데요, 이를 사용하려면 시크릿 키의 길이가 충분히 길어야(256비트)합니다.

BASE_64로 인코딩된 문자열은 터미널에서 간단하게 확인할 수 있습니다.

```shell
$ echo 'gongcheck-gongcheck-gongcheck' | base64
Z29uZ2NoZWNrLWdvbmdjaGVjay1nb25nY2hlY2stZ29uZ2NoZWNrCg==
```

```java
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;

public class JwtTokenProvider {

    private final Key key = Keys.hmacShaKeyFor(
            Decoders.BASE64.decode("Z29uZ2NoZWNrLWdvbmdjaGVjay1nb25nY2hlY2stZ29uZ2NoZWNrCg=="));
    private final long expireTime = 360000;

    public String createToken(final String subject) {
        Date now = new Date();
        Date expireDate = new Date(now.getTime() + expireTime);

        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expireDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractSubject(final String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            throw new IllegalStateException("만료된 토큰입니다.");
        } catch (JwtException e) {
            throw new IllegalStateException("올바르지 않은 토큰입니다.");
        }
    }
}

```

그런데 `JwtTokenProvider`가 가지고 있는 상태는 읽기 전용이고, 이후에 등록될 스프링 빈들에 의해 사용될 일이 많으므로 빈으로 등록해도 될 것 같습니다.
또한 secret key는 외부에 노출되면 안되기 때문에 프로퍼티로 따로 관리하는 것이 좋을 것 같습니다.

application.properties
```properties
security.jwt.token.secret-key=Z29uZy1jaGVjay1nb25nLWNoZWNrLWdvbmctY2hlY2stZ29uZy1jaGVjay1nb25nLWNoZWNrLWdvbmctY2hlY2stZ29uZy1jaGVjay1nb25nLWNoZWNrCg==
security.jwt.token.expire-time=3600000
```

이를 적용하면 아래와 같습니다.

```java
@Component
public class JwtTokenProvider {

    private final Key key;
    private final long expireTime;

    public JwtTokenProvider(@Value("${security.jwt.token.secret-key}") final String secretKey,
                            @Value("${security.jwt.token.expire-time}") final long expireTime) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
        this.expireTime = expireTime;
    }

    ...
}
```

<br>

이제 사용자가 로그인 요청을 보내면 아이디와 패스워드를 확인한 후 토큰을 생성하여 반환해주면 됩니다.
```java
@Service
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    public AuthService(JwtTokenProvider jwtTokenProvider, MemberRepository memberRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.memberRepository = memberRepository;
    }

    public String createToken(String username, String password) {
        Member member = memberRepository.findByUsername(username).orElseThrow();
        member.checkPassword(password);
        return jwtTokenProvider.createToken(member.getUsername());
    }
}
```
subject는 username으로 설정했습니다.

<br>

```java
@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginRequest request) {
        String token = authService.createToken(request.getUsername(), request.getPassword());
        HashMap<String, String> response = new HashMap<>();
        response.put("accessToken", token);
        return ResponseEntity.ok(response);
    }
}
```

## 인가

이번엔 클라이언트에서 보낸 토큰을 이용해 인가처리를 구현해보도록 하겠습니다.

클라이언트는 인가가 필요한 요청에 대해 `Authorization` 헤더에 토큰 값을 담아 요청을 보낼 것입니다.
```HTTP
'Authorization: Bearer jwt.token.here
```

### ArgumentResolver

가장 간단하게 생각해볼 수 있는 방법은 애너테이션을 이용해 아규먼트 리졸버에서 subject를 뽑아 넘겨주는 것입니다.

핸들러 메서드는 다음과 같은 형태가 될 것입니다.
```java
@RestController
public class AuthController {

    ...

    @GetMapping("/profile")
    public ResponseEntity<Profile> showProfile(@AuthenticatePrincipal String username) {
        Profile profile = authService.getProfile(username);
        return ResponseEntity.ok(profile);
    }
}

```

<br>

핸들러 메서드의 파라미터에 `@AuthenticationPrincipal`처럼 특정 애너테이션이 붙어있는 경우 특정 타입을 반환하고 싶다면 커스텀 아규먼트 리졸버를 등록하고 여기서 적절한 처리를 해주도록 하면 됩니다.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(value = ElementType.PARAMETER)
public @interface AuthenticatePrincipal {
}
```
```java
@Component
public class AuthenticationPrincipalArgumentResolver implements HandlerMethodArgumentResolver {

    private final JwtTokenProvider jwtTokenProvider;

    public AuthenticationPrincipalArgumentResolver(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(AuthenticatePrincipal.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        String header = webRequest.getHeader(HttpHeaders.AUTHORIZATION);
        String token = extractToken(header);
        return jwtTokenProvider.extractSubject(token);
    }

    private String extractToken(String header) {
        return header.split(" ")[1];
    }
}
```
<br>

커스텀 아규먼트 리졸버는 설정정보를 통해 따로 등록해주어야 합니다.
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthenticationPrincipalArgumentResolver principalArgumentResolver;

    public WebConfig(AuthenticationPrincipalArgumentResolver principalArgumentResolver) {
        this.principalArgumentResolver = principalArgumentResolver;
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(principalArgumentResolver);
    }
}
```

이렇게 인가 처리를 구현했습니다.

## 책임분리

하지만 고민할 사항이 하나 있습니다. 아규먼트 리졸버는 요청으로 넘어온 값을 핸들러에게 필요한 적절한 타입으로 변환해 넘겨주는 책임을 가집니다. 하지만 
우리가 만든 아규먼트 리졸버는 토큰 값을 추출하고 핸들러가 필요한 값을 넘겨주는 두 가지 책임을 가지고 있습니다.

인가 처리라는 하나의 관심사만을 담당하는 새로운 객체를 고민해볼 수 있을 것 같습니다. 인가 처리는 다른 핸들러에서도 필요한 공통 관심사이죠. 웹 요청에 대한 공통 관심사 처리는 인터셉터에게 위임하는 것이 적절해보입니다.

```java
@Component
public class AuthenticationInterceptor implements HandlerInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    public AuthenticationInterceptor(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = extractToken(header);
        String subject = jwtTokenProvider.extractSubject(token);
        // subject를 어떻게 전달하지?
        
        return true;
    }

    private String extractToken(String header) {
        return header.split(" ")[1];
    }
}
```

<br>

`HandlerInterceptor`에서 추출한 subject를 컨트롤러까지 전달하려면 어떻게 해야할까요?

가장 간단한 방법으로는 request 객체에 값을 담아서 보내는 것을 생각해볼 수 있습니다. 하지만 토큰을 resolve한 값을 전달하는 것이 HttpServletRequest의 책임일지는 고민해볼만한 것 같습니다.

저희 팀은 HttpServletRequest의 책임을 온전히 클라이언트 쪽에서 넘어온 데이터를 전달하는 것으로 보고, 추출한 subject를 담아두는 책임을 가지는 새로운 객체를 정의하기로 했습니다.

### AuthenticationContext

인증 정보를 담는 컨텍스트 역할을 하는 객체를 정의하고 이를 활용해보도록 하겠습니다.

```java
@Component
@RequestScope
public class AuthenticationContext {

    private String principal;

    public String getPrincipal() {
        return principal;
    }

    public void setPrincipal(String principal) {
        this.principal = principal;
    }
}
```

인증 정보는 하나의 웹 요청 안에서만 사용되므로 해당 빈의 Scope를 Request로 제한해줍니다.

인터셉터에서 뽑아낸 값을 AuthenticationContext에 담아두고 아규먼트 리졸버에서 꺼내 핸들러로 넘겨주도록 합니다.

```java
@Component
@Slf4j
public class AuthenticationInterceptor implements HandlerInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationContext authenticationContext;

    public AuthenticationInterceptor(JwtTokenProvider jwtTokenProvider, AuthenticationContext authenticationContext) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationContext = authenticationContext;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        String token = extractToken(header);
        String subject = jwtTokenProvider.extractSubject(token);
        authenticationContext.setPrincipal(subject);

        return true;
    }

    private String extractToken(String header) {
        return header.split(" ")[1];
    }
}

```

```java
@Component
public class AuthenticationPrincipalArgumentResolver implements HandlerMethodArgumentResolver {

    private final AuthenticationContext authenticationContext;

    public AuthenticationPrincipalArgumentResolver(AuthenticationContext authenticationContext) {
        this.authenticationContext = authenticationContext;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(AuthenticatePrincipal.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        return authenticationContext.getPrincipal();
    }
}
```

<br>

인터셉터 또한 설정 정보를 통해 등록하고 인터셉터가 동작하도록 할 URI Path를 정해줄 수 있습니다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthenticationPrincipalArgumentResolver principalArgumentResolver;
    private final AuthenticationInterceptor authenticationInterceptor;

    public WebConfig(AuthenticationPrincipalArgumentResolver principalArgumentResolver,
                     AuthenticationInterceptor authenticationInterceptor) {
        this.principalArgumentResolver = principalArgumentResolver;
        this.authenticationInterceptor = authenticationInterceptor;
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(principalArgumentResolver);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authenticationInterceptor)
                .addPathPatterns("/profile");
    }
}
```

이렇게 토큰 기반 인증, 인가 구현 로직을 작성해보았습니다. 감사합니다.