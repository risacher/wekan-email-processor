# wekan-email-processor
connector from exim4 'pipe' transport to Wekan


```
sudo cp exim4+conf.d+router+901_wekan_submission
sudo cp exim4+conf.d+transport+91_wekan

sudo mkdir /usr/local/wekan/
sudo mkdir /usr/local/wekan/bin
sudo cp wekan-mail /usr/local/wekan/bin/
sudo chmod ugo+x /usr/local/wekan/bin/wekan-mail

sudo update-exim4.conf
sudo service exim4 reload

```