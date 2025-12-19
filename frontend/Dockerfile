# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Set API URL for build
ARG REACT_APP_API_URL=https://mood-tracker-api.onrender.com
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
