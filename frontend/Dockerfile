FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_INCIDENT_SERVICE_URL
ARG VITE_RESOURCE_SERVICE_URL

ENV VITE_INCIDENT_SERVICE_URL=$VITE_INCIDENT_SERVICE_URL
ENV VITE_RESOURCE_SERVICE_URL=$VITE_RESOURCE_SERVICE_URL

RUN npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]