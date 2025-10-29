# Spring Boot 3.1.5 → 3.5.7 Upgrade Plan

## Current State
- **Current Version**: Spring Boot 3.1.5
- **Target Version**: Spring Boot 3.5.7
- **Java Version**: 21 (compatible)
- **Project**: Order Service Microservice

## Upgrade Steps

### 1. Update Parent Dependency
- Change Spring Boot version from 3.1.5 to 3.5.7
- Update Spring Cloud version for compatibility

### 2. Dependencies to Review
- **Spring Statemachine**: Currently 3.2.1 - check compatibility
- **MapStruct**: Currently 1.5.5.Final - may need update
- **Micrometer**: Managed by Spring Boot BOM

### 3. Potential Breaking Changes (3.1.5 → 3.5.7)
- Review deprecation warnings
- Check for removed configuration properties
- Validate Spring Security changes (if any)
- Review Spring Data JPA changes

### 4. Testing Strategy
- Run existing tests after upgrade
- Check application startup
- Verify Kafka connectivity
- Test database connections
- Validate Redis connectivity

### 5. Configuration Updates
- Review application.yml/properties for deprecated properties
- Check actuator endpoints
- Verify Prometheus metrics compatibility

## Implementation Order
1. Backup current working state
2. Update pom.xml dependencies
3. Build and test compilation
4. Run unit tests
5. Integration testing
6. Deploy to development environment

## Rollback Plan
- Git commit before changes
- Keep backup of working pom.xml
- Document any configuration changes needed