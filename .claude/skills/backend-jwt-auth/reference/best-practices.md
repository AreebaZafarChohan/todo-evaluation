# JWT Security Best Practices

1. **Keep Secrets Secret**: Use environment variables for `SECRET_KEY`.
2. **Use HTTPS**: JWTs are sent in headers; they must be encrypted in transit.
3. **Don't Store Sensitive Data**: Claims are readable by anyone who has the token. Never store passwords or PII.
4. **Token Revocation**: Since JWTs are stateless, use a blacklist (Redis) or short TTLs to handle logout/revocation.
5. **Algorithm Verification**: Explicitly check the `alg` header during verification to prevent bypass attacks.
