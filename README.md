# wekan-email-processor
connector from exim4 'pipe' transport to Wekan

This doesn't work yet.  Just proof-of-concept examples.

As of now, wekan-mail ingests mail from exim4, parses it and dumps it to a file in /tmp/

Separately wekan-api-test.js show an example of how to use the wekan API from nodejs.


```
sudo cp exim4+conf.d+router+901_wekan_submission /etc/exim4/conf.d/router/901_wekan_submission
sudo cp exim4+conf.d+transport+91_wekan /etc/exim4/conf.d/transport/91_wekan

sudo mkdir /usr/local/wekan/
sudo mkdir /usr/local/wekan/bin
sudo cp wekan-mail /usr/local/wekan/bin/
sudo chmod ugo+x /usr/local/wekan/bin/wekan-mail

sudo update-exim4.conf
sudo service exim4 reload

```
