# Social Media API

A RESTful social media API built with Node.js, Express and MongoDB. Users can sign up, publish posts, follow each other and like posts.

AltSchool Africa — Backend Engineering, Second Semester Exam Project.

**Live URL:** https://socialmediaapi-f6md.onrender.com

> The free Render instance sleeps after inactivity. The first request after an idle period can take up to 50 seconds.

---

## Tech stack

| Layer            | Choice                                 |
| ---------------- | -------------------------------------- |
| Runtime          | Node.js                                |
| Framework        | Express                                |
| Database         | MongoDB with Mongoose                  |
| Auth             | JWT (`jsonwebtoken`), 1 hour expiry    |
| Password hashing | bcrypt                                 |
| Testing          | Jest, supertest, mongodb-memory-server |
| Hosting          | Render                                 |

---

## Getting started

```bash
git clone <https://github.com/Femolala64/SocialMediaAPI.git>
cd SocialMedia-api
npm install
```

Create a `.env` file in the project root:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

Start the server:

```bash
npm start
```

Development with auto-reload:

```bash
npm run dev
```

---

## Running the tests

```bash
npm test
```

Tests run against an in-memory MongoDB instance, so no real database is touched and no seed data is required. The database is wiped between individual tests, which keeps each test independent.

The first run downloads a MongoDB binary and may take a minute.

---

## API reference

Base URL: `/api/v1`

All authenticated routes expect an `Authorization: Bearer <token>` header.

### Auth

| Method | Path           | Auth | Description                       |
| ------ | -------------- | ---- | --------------------------------- |
| POST   | `/auth/signup` | No   | Create an account. Returns a JWT. |
| POST   | `/auth/signin` | No   | Sign in. Returns a JWT.           |

### Posts

| Method | Path                 | Auth | Description                                             |
| ------ | -------------------- | ---- | ------------------------------------------------------- |
| POST   | `/posts`             | Yes  | Create a post. Always starts in `draft`.                |
| GET    | `/posts`             | No   | List published posts. Paginated, searchable, orderable. |
| GET    | `/posts/me`          | Yes  | List your own posts. Paginated, filterable by state.    |
| GET    | `/posts/:id`         | No   | Get one published post, with its author.                |
| PATCH  | `/posts/:id/publish` | Yes  | Publish a post you own.                                 |
| PATCH  | `/posts/:id`         | Yes  | Edit a post you own.                                    |
| DELETE | `/posts/:id`         | Yes  | Delete a post you own.                                  |

### Follows

| Method | Path                 | Auth | Description          |
| ------ | -------------------- | ---- | -------------------- |
| POST   | `/follows/:id`       | Yes  | Follow a user.       |
| DELETE | `/follows/:id`       | Yes  | Unfollow a user.     |
| GET    | `/follows/following` | Yes  | Users you follow.    |
| GET    | `/follows/followers` | Yes  | Users following you. |

### Likes

| Method | Path         | Auth | Description       |
| ------ | ------------ | ---- | ----------------- |
| POST   | `/likes/:id` | Yes  | Like a post.      |
| DELETE | `/likes/:id` | Yes  | Remove your like. |

---

## Query parameters

### `GET /posts`

| Parameter | Default     | Description                                       |
| --------- | ----------- | ------------------------------------------------- |
| `page`    | 1           | Page number                                       |
| `limit`   | 20          | Results per page                                  |
| `title`   | —           | Partial, case-insensitive title match             |
| `tags`    | —           | Match posts carrying this tag                     |
| `author`  | —           | Partial, case-insensitive username match          |
| `orderBy` | `createdAt` | One of `like_count`, `comment_count`, `createdAt` |
| `order`   | `desc`      | `asc` or `desc`                                   |

Only published posts are ever returned from this endpoint. Draft state is not client-controllable here.

### `GET /posts/me`

| Parameter | Default | Description                                          |
| --------- | ------- | ---------------------------------------------------- |
| `page`    | 1       | Page number                                          |
| `limit`   | 20      | Results per page                                     |
| `state`   | —       | `draft` or `published`. Any other value returns 400. |

---

## Data models

**User** — `first_name`, `last_name`, `username` (unique), `email` (unique), `password`, timestamps.
Passwords are hashed by a pre-save hook and never returned in a response.

**Post** — `title`, `content`, `author` (ref User), `tags` (array), `state` (`draft` | `published`), `like_count`, `comment_count`, timestamps.

**Follow** — `follower` (ref User), `following` (ref User), timestamps.
A compound unique index on the pair prevents duplicate follows at the database level.

**Like** — `user` (ref User), `post` (ref Post), timestamps.
A compound unique index on the pair prevents duplicate likes at the database level.

---

## Notes on the brief

Two points in the requirements were ambiguous. Here is how each was resolved.

**`comment_count`** — Requirement 21 lists `comment_count` among the fields a post should carry, but no requirement specifies a comment feature. The field exists on the Post model and defaults to `0`, and it is available as a sort key under requirement 24. No comment endpoints were built, since none were asked for.

**The feed** — The introduction mentions a feed of a user's own posts plus posts from people they follow, but no numbered requirement asks for one. It was left out to keep the implementation to the specified scope.

---

## Implementation notes

**Ownership is checked on every write.** Publish, edit and delete each compare the post's author against the id carried in the request's token, and return `403` on a mismatch.

**Field assignment is explicit, never spread.** The update endpoint assigns only `title`, `content` and `tags`. A client cannot set `state`, `like_count` or `author` through it, so the publish endpoint and its ownership check cannot be bypassed.

**Duplicate prevention is enforced at the database level.** Follows and likes both rely on compound unique indexes rather than a read-then-write check, which closes the race between two simultaneous requests.

**Like counts are updated atomically** with `$inc` rather than read-modify-write, so concurrent likes cannot overwrite each other.
