# GLSL.io

Source code of [GLSL.io](http://glsl.io/) , the open platform to build an Open Collection of [GLSL Transitions](http://github.com/gre/glsl-transition).

Technologies
---

- **server**: Scala stack: [Play Framework](http://playframework.org), [Akka](http://akka.io), [ReactiveMongo](http://reactivemongo.org)
- **client**: JavaScript stack: [Browserify](http://browserify.org) + [React](http://facebook.github.io/react/) + much more [NPM modules](https://github.com/glslio/glsl.io/blob/master/client/package.json#L17)

Build & Run
---

**Building Front End stack:**

Requires: http://nodejs.org/ installed. Also http://gruntjs.com/installing-grunt

```bash
# in ./client/
npm install && grunt
```

**Running the Server:**

Requires: http://www.scala-sbt.org/ installed +  a registered Github application

```bash
#!/bin/bash
# to put in a script – in ./server/
APP_SECRET=...
GIST_ROOT_ID=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_COOKIE=...
GITHUB_AUTHENTICITY_TOKEN=...
sbt -Dglslio.rootGist="$GIST_ROOT_ID" -Dapplication.secret="$APP_SECRET" -Dgithub.client.id=$GITHUB_CLIENT_ID -Dgithub.client.secret="$GITHUB_CLIENT_SECRET" -Dgithub.cookie="$GITHUB_COOKIE" -Dgithub.authenticity_token="$GITHUB_AUTHENTICITY_TOKEN" $*
```

Then in SBT console, type `run`.

License
---

    GLSL.io - GPL v3 Licence

    Copyright (c) 2014 @greweb

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

ROADMAP
---

[https://github.com/glslio/glsl.io/issues/60](https://github.com/glslio/glsl.io/issues/60)

Release Notes
---

### Version 1.6 – 17 July 2014
- **Improve how you can use GLSL Transitions**: 
  - **Home** : a new Home page explains a bit more what are GLSL Transitions and how to use them.
  - **Video support**: the /embed is now using videos to demonstrate a bit more the usability of GLSL Transitions.
  - **glsl-transitions**: is a new package on Github/NPM which is a daily updated snapshot of GLSL.io transitions.
  - **glsl-transition-examples**: is a bunch of examples to explain how to use `glsl-transition` and `glsl-transitions`.
- **Editor**:
  - Share feature: Social networks / link / embed
- **Galery**:
  - Some new images is now used.
- **Misc**
  - GLSL.io is now hosted on a dedicated server.
  - Fix the project on case sensitive filesystem.
  - #85 : Improve SEO.
  - #84 : Does not disallow user-select for the blog section.
  - #13 : if WebGL is not supported for the user browser, display a banner warning. '/blog' is also display instead of '/'.

### Version 1.5 – 29 June 2014
- **Editor**: improving Developer Experience
  - #10 : Provides **Contextual GLSL Documentation** when clicking on a GLSL word in the editor.
  - Add **Autocompletion** using `C-SPACE` shortcut
  - #79 : Configuration panel: Customize the Bezier Easing + Transition Duration + Transition Pause Delay
  - #77 : Inform "invalid" transition: if *from -> to* images are not correctly displayed at from/to progress.
  - #75 : Improve the Sampler2D uniform picker + #72 Support imgur images
  - #33 : Performance feedback: a FPS indicator displaying the transition frames per second.
- **Gallery**
  - #17 : Add an **Author page**: a public user gallery of transitions. e.g. `/user/gre`
  - #74 : Split Public Gallery / My Transitions
   - The gallery is the same for all: only contains published transitions
   - A "My Transitions" screen displays all user transitions by category: invalid / unpublished / published + comments count
  - #70 : the gallery is now also paginated in the url
- **Blog**
  - Add a blog system based on Gists
- **Misc**
  - Replace the "Found a bug" in the footer by a "Feedback" button at the right. More visible.
  - If something break by trying to open a page, the error screen is opened and a direct link is able to pre-fill a Github issue (with JS stacktrace and contextual information)

### Version 1.4 - 18 June 2014
- #53 : **Sampler2D User Uniforms are now supported!** It means you can use external textures (currently from a set of glslio textures) as parameter of a Transition. [example](https://glsl.io/transition/0141a38779af3a652c22) / thanks to @rectalogic for the feature request.
- **Bugfixes**
  - #71 : some `input[type=number]` bugs with React has been fixed
  - an unpublished transition was visible in the gallery in 1.3 version.
- **Misc**
  - #67 : Gallery is now the home page, About page is on `/about`
  - `glsl-transition` has been splitted into two packages: `glsl-transition` and `glsl-transition-core`. [See this issue](https://github.com/glslio/glsl-transition/issues/12)
  - Externalize the validation of a GLSL Transition into `glsl-transition-validator`
  - Create new modules (some experimental) – see [https://github.com/glslio](https://github.com/glslio)

### Version 1.3 - 11 June 2014
- Big technical release:
  - #69 : Migrate the client codebase to React Library + modularisation.
  - Upgrade the server to Playframework 2.3.
  - #66 : Website in HTTPS : https://glsl.io/
  - Opened http://staging.glsl.io/ for beta testing incoming features – it is like GLSL.io but unstable.
- Update images used in the Gallery and the Editor.
  - Add automation in the images generation into different formats.
- Gallery and Editor: Pre-load and cache some resources for faster experience.
- Improve pager of the gallery.

### Version 1.2 - 28 May 2014

- **Gallery**
  - #16 : Add an "Unpublished transitions" section to display the user not published transitions.
  - #11 : Add Pagination.
  - #54 : Free the gallery memory when leaving it
  - Center the gallery
- **Editor**
  - #50 : Support for new custom uniform types: mat2, mat3, mat4, ivec2, ivec3, ivec4, bvec2, bvec3, bvec4
  - #46 : Add Ctrl+S / ⌘+S shortcut support for saving the transition
  - #57 : Bugfix an editor freeze when trying to use unsupported uniform types
  - #45 : Make sure all GLSL errors get caught by the validator (double check the GLSL both by compiling it and running it into glsl-parser which had some differences in order that you can't save an invalid Transition)
  - #24 : Add a comments count meta info in the Transition
  - Bugfix the uniform change detection so that a uniform can be changes live (instantly see the result in the current transition)
- **Misc**
  - #41 : Twitter stream is available in about page
  - WIP for a better Twitter Card Integration

### Version 1.1 - 21 May 2014

- #4 #5 #34 : **Server refactoring**
  - Track gists changes (if directly editing the gist)
  - separation of concerns needed for next features
  - several bugfixes
- **Editor**
  - #3 : Bugfix the loop failing to restart after re-compilation (include a bugfix in glsl-transition itself)
  - #2 : Fix a text overflow in the compilation status bar
  - #28 : The template also have a Gist Link
  - Unifying the Transition name with the Gist Link
  - #27 : Add a "MIT License" mention (hardcoded, the gist ~LICENSE is not read)
  - #14 : Polishing the warning message of the page reload confirm popup
  - Bugfix the vector uniforms changes detection
- **Misc**
  - #15 : When login/logout, stay on the same URL
  - #29 : Improve meta data in <head> for social networks

### Version 1.0 - 19 May 2014

- Github authentification
- Gist support (read forks on bootstrap, save to gist only)
- Minimal gallery with overview controls
- Minimal editor: live GLSL editor, uniforms, overview
- Create a Transition
- Save a Transition
- About page
