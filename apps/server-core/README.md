# Entail App Server Core

This project contains the core code that makes up the backend infrastructure that entail runs on.

In its current state, the project provides a monolithic codebase with hard
separation between individual components. This will ensure that the project can
later be split into a collection of microservices for more scalable deployment.

### How to start

1. Ensure you have followed the steps in the global readme
2. Open 2 terminal windows
3. In the first terminal run `rush build:watch --to-except server-core` to start the watched builders for any dependencies of server-core
4. In the second terminal go to the server-core folder and run `rushx start:dev` to start the watched server which will pick up any local changes and any changes to the dependencies

### Architectural Components:
- Framework: NestJS
- Logging: TBC
- Tracing: Sentry + TBC
- Error Reporting: Sentry
- Databases: DGraph

```plantuml
skinparam linetype ortho

legend
|= flag       |= |
| @reverse    | Marks a field as omni-directionally traversable |
| @count      | Counts number of edges on predicate |
| @index[i]   | Marks field as indexable with granularity of 'i' |
| @upsert     | Flag to mark field as unique if multiple mutations are run on it in a query |
| <abc: xyz> | A facet 'abc' of type 'xyz' on the edge |
|= type       |= |
| xx[]        | Equates to [uid] with uid being of the type given by 'xx' |
endlegend

together {
  class Profile {
    authId: string @index[hash] @upsert
    firstName: string
    lastName: string
    email: string @index[hash] @upsert
    /**
      Edge directional from Profile -> Alias 
      since we are more likely to go 
      that way than back.
    **/
    aliases: Alias[] @reverse
    dob: DateTime
    /**
      This value is recalculated based on the user's 
      DOB on every first interaction after 00:00 of 
      each day in their timezone.
    **/
    is18: boolean
  }
  Profile }|--|{ Alias
  class Alias {
    username: string @index[hash]
    displayName: string @index[term]
    pronouns: string
    bio: string
    about_page: Medium
    avatar: Medium
    banner: Medium
    location: string
    website: string
    /**
      Edge directional from following
      since an average following count
      will be lower then the follower one.
    **/
    following: Alias[] @reverse @count <since: DateTime>
    /**
      Tags are for analytics and search.
      Derived but user can tailor.
    **/
    tags: Tag[] @reverse
    // Had to split the facets due to size
    liked: Post[] | Medium [] <date: DateTime>
    boosted: Post[] <date: DateTime>
    shared: Post[] | Medium [] <date: DateTime>
    nsfw: string
    isNSFW: boolean
  }
  Alias ||--o{ Post
  Alias }|--o{ Medium
  Alias }|--o{ Collection
  Alias }o--o{ Tag
}

together {
  class Medium {
    owners: Alias[] @reverse
    artists: Alias[] @reverse
    type: MediaType
    title: string
    description: string @index[term]
    text: string @index[term]
    tags: Tag[] @reverse
    alt_text: string
    /** 
      Value is either:
      The URL to reach the resource
      OR
      story://<db id> for stories
    **/
    uri: string
    // Cannot be child if not empty
    children: Medium[] @reverse
  }
  class Collection {
    owners: Alias[] @reverse
    title: string @index[term]
    description: string @index[term]
    tags: Tag[] // Derived? @reverse
    media: Medium[] | Post[]
  }
  enum MediaType {
    Image
    Video
    Audio
    Story
    File
  }
  Medium }o--|| MediaType
  Medium }o--o{ Tag
  Collection }o--o{ Medium
  Collection }o--o{ Post
  Collection }o--o{ Tag
}

together {
  class Post {
    owner: Alias @reverse
    mentioned: Alias[] @reverse
    tags: Tag[] @reverse
    // This is only on media posts
    title: string @index[term]
    text: string @index[term]
    /**
      Only has multiple media when multi-image
    **/
    media: Medium[]
  }
  Post }o--o{ Medium
}

together {
  class Entry {
    createdAt: dateTime
    updatedAt: dateTime
  }  
}

together {   
  class Tag {
    name: string @index[exact]
    description: string
    nsfw: boolean
    official: boolean
    children: Tag[] @reverse
  }
}
```
