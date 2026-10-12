# Build context is the repo root: the app imports API contracts from backend/src/contracts.
FROM node:22-alpine AS build
WORKDIR /repo
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY backend/src/contracts ./backend/src/contracts
COPY frontend ./frontend
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN cd frontend && npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /repo/frontend
COPY --from=build /repo/frontend ./
USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
