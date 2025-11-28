# Docker Debug
## Build
docker-compose up -d --build
## Log
docker-compose logs -f
## Status
docker-compose ps -a
## End
docker-compose down
## Build  service step by step
docker-compose build service-registry
docker-compose build api-gateway
docker-compose build user-service
docker-compose build product-service
docker-compose build order-service
docker-compose build cart-service
docker-compose build payment-service
docker-compose up -d
## Delete cache
docker builder prune -a
