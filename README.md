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
