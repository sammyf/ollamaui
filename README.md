### Ollamaui

Yet Again An Ollama UI ... This one is Cloudflare 524 safe, it implements
* seamless personalities switch
* TTS
* shared context between personalities
* seamless model swapping
* long term memories
* autonomous internet search (via a SearxNG Instance) 
* autonomous webpage retrieval.

Do you need it? Probably not, but it's fun to write, so sue me ...

#### Here is what it looks like ...

![screenshot.png](src/assets/images/screenshot.png)

#### DISCLAIMER

This code comes with no guarantee whatsoever. You'll need to have an ollama server running under the 
same URL to bypass CORS, and ~~if you use the companion app~~ the companion app you WILL need to make this work, 
will need to use the same URL too and have direct access to Ollama without using URL's! This change was needed 
to fix timeouts caused by too long request being blocked by CloudFlare. 

Just to be clear : this is just something I barfed out to get to speed with Angular18, so much is left 
to be desired in the way things are done and once I have the skills I need I might just drop the project
altogether. So don't expect help running it or me fixing issues you find. If you like it then I really 
encourage you to fork it and work on it yourself. Coding is a fun activity when it's raining outside.

#### REQUIREMENT :
*Please note that ollama and the companion apps must be accessible through the same URL. 
For most users this will be http://localhost/ or the equivalent http://127.0.0.1
Help to expose the service outward is further down.*

* The excellent Ollama can found at https://ollama.com/
* The python TTS and webpage fetching companion ( https://github.com/sammyf/tts_webapp ) 
* The Go companion ( https://github.com/sammyf/ollamaui_companion )
* A MariaDB or MySql instance, and a user with GRANT and CREATE privileges ( root for example)


#### Installation
Install the companion apps by cloning their repos and following their respective installation instructions.

`npm install`

#### HOW TO RUN IT :
Make sure the Companion Apps are running.
./serve.sh

#### HOW TO EXPOSE THE SERVICE OUTWARD
First of all : **don't**! If you really want or need to, then at least implement some basic auth in front. 
To avoid CORS problems the main application and the companion need to be accessible through the same URL.
The ollama and SQL server need to be accessible in the LAN. Ollama will need to listen to 0.0.0.0 if it is 
not running on the same machine as ollamaui_companion.

you'll need to use a reverse proxy (haproxy for example) to redirect the requests between the main application and 
the companion apps.

* Calls to the python TTS app can be identified by the path, which starts with /companion/
* Calls to the go companion can be identified by the path, which starts with /async/

Fitting acl rules for haproxy looks like that :

```
acl is_companion path_beg /companion/
acl is_asyncomp path_beg /async/
```

Good luck! You'll probably need it.

![logo-medium.png](src/assets/images/logo-medium.png)

---------------------
