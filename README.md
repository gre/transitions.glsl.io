# GLSL.io

The open platform to build an Open Collection of [GLSL Transitions](http://github.com/gre/glsl-transition).

See [GLSL.io](http://glsl.io/) for more information.

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

Technologies
---

- /server: Play Framework (scala), Akka, ReactiveMongo
- /client: Browserify [+ see NPM modules](https://github.com/glslio/glsl.io/blob/master/client/package.json#L17)

Build & Run
---

Building Front End stack:

```bash
cd client/ && grunt
```

Running the Server (requires a registered Github application):

```bash
GIST_ROOT_ID=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
APP_SECRET=...
sbt -Dglslio.rootGist="$GIST_ROOT_ID" -Dapplication.secret="$APP_SECRET" -Dgithub.client.id=$GITHUB_CLIENT_ID -Dgithub.client.secret=$GITHUB_CLIENT_SECRET run
```

Release Notes
---

### Version 1.0

- Github authentification
- Gist support (read forks on bootstrap, save to gist only)
- Minimal gallery with overview controls
- Minimal editor: live GLSL editor, uniforms, overview
- Create a Transition
- Save a Transition
- About page

### Version 1.1

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
