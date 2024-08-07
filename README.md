# Ollamaui
## Here is what it looks like ...

![screenshot.png](src/assets/images/screenshot.png)

This code comes with no guarantee whatsoever. You'll need to have an ollama server running under the 
same URL to bypass CORS, and ~~if you use the companion app~~ the companion app you WILL need to make this work, 
will need to use the same URL too and have direct access to Ollama without using URL's! This change was needed 
to fix timeouts caused by too long request being blocked by CloudFlare. 

Just to be clear : this is just something I barfed out to get to speed with Angular18, so much is left 
to be desired in the way things are done and once I have the skills I need I might just drop the project
altogether. So don't expect help running it or me fixing issues you find. If you like it then I really 
encourage you to fork it and work on it yourself. Coding is a fun activity when it's raining outside.

### REQUIREMENT : 

* The excellent Ollama can found at https://ollama.com/
* The TTS companion application can be found at https://github.com/sammyf/tts_webapp 

### HOW TO RUN IT :
`npm install`

`ng serve`



![logo-medium.png](src/assets/images/logo-medium.png)

---------------------

Just leaving the automatically generated stuff here, as it might help you out a bit.

____________________________________________________________________________________

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.1.1.

## Development server

Run `ng serve` for a dev server. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
