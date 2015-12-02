# Shoutout Web

CS 242 project

## Setup
    $ pip install -r requirements.txt

If you pip install more things, generate the requirements file again with:

    $ pip freeze > requirements.txt

Also make sure you run: 

    $ npm install 

To make sure that you install the client-side dependencies. 

To setup the parse api keys run:

    $ cp soweb/endpoints/config.py soweb/endpoints/real_config.py

Then change the values inside real_config.py to be the values from the parse web dashboard

## Developing (Client-Side)
Run :

    $ gulp

To compile everything before starting up the development server. Gulp will then watch for any changes in JavaScript files.  


## Running
Once you run the `gulp` command - open up another terminal, navigate to the project, and then run:

    $ python run.py runserver
