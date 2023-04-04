# CS6024 Project 2

This project is about calls to 3-1-1 in Cincinnati, Ohio.

Project Link: <https://uc.instructure.com/courses/1581844/pages/project-2-who-you-gonna-call-3-1-1>

Project information can also be found in the [`/general-info`](./general-info) directory.

## Team Members

- Caleb Anthony
- Scott Fasone
- Allison Meier
- Manish Raj Aryal

## Running the application

To run this project, simply serve this project repository using an HTTP server, using a simple script or a fully-featured one like Nginx.

### Hosting the repository

Using Python's `SimpleHTTPServer`

```bash
# with Python 3
python -m http.server
# with Python 2
python -m SimpleHTTPServer
```

Using NPM's `http-server`:

```bash
npx http-server .
```

For more options, this [MDN Guide](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server)

## Developing the application

This project was developed using TypeScript, then compiled to JavaScript for use on the web.

To install the necessary dependencies, run `npm install` in the project directory.
Then the code can be edited in the `src` directory and re-compiled by running `npm run build`.
Afterward just serve the directory and access it in you browser.

For more convenient development, after installing the dependencies, `npm run dev` can be used to both serve the application *and* automatically recompile the TypeScript when any file changes occur.
