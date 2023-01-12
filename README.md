<a name="readme-top"></a>
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/jonathonor/syncbot">
    <img src="syncBotLogo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">SyncBot</h3>
  <p>
    A bot that syncs roles between one main server, and multiple other discord servers.</p>
  <p>
  <p>OR</p>
A bot that sync roles between multiple synced servers, and one main server.</p>
    <a href="https://www.jonsbots.com/syncbot"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://discord.gg/f8SUVvQZD3">My Discord</a>
    ·
    <a href="https://github.com/jonathonor/syncbot/issues">Report Bug</a>
    ·
    <a href="https://github.com/jonathonor/syncbot/issues">Request Feature</a>
    ·
    <a href="https://jonsbots.com">My Website</a>
  </p>
</div>

<div align="center">
  <a href='https://ko-fi.com/L3L8HSMV0' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

This is a side project I started back in 2019 to help a friend in managing his multiple discord servers. The bot is very helpful for server owners who share roles between servers based on certain subscriptions or packages the user has gained access to. I would highly recommend checking out my website where I dive in deep to how the bot works, what all it does, and even share some walkthrough videos of it in action. Thanks for stopping by and reach out to me on Discord if youd like to connect!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Use Cases - Running Regular SyncBot 
#### (a single main server feeding roles to multiple synced servers)
Manual Operations
 - Adding Roles
   - You have a user in your main server, and you use the discord UI to give the user role1, the bot will look up any role named "role1" in each additional server and give the user that role in each of the additional servers as well.
   - You have a user in your main server, and you use the /add command with @role1 @username, the bot will look up the role named "role1" in each additional server and give the user that role in each of the additional servers as well.
 - Removing Roles
   - You have a user in your main server, and you use the discord UI to remove role1 from the user, the bot will see if the user exists in each of the additional servers, and will remove the role from them there as well.
   - You have a user in your main server, and you use the /remove command with @role1 @username, the bot will see if the user exists in each of the additinoal servers, and will remove the role from them there as well.
 - Role Verification
   - Your bot has gone down at some point and you don't know what roles each user has in your synced servers.
     - You can run the role-checker command with the analyze option which sends you a file detailing the differences between your users roles in each server.
     - You can run the role-checker command with the force-sync option which will return all users in all synced servers roles to match the main server roles they have.

Automatic Operations
 - You have a user in your main server, and you invite them to an additional server. When the user joins the additional server, any roles that they have in the main server will be applied automatically to them on join of the additional server. 
   - example: Jim is part of the mainserver and has role1, and then Jim joins a synced server. Jim automatically has role1 upon joining the synced server.
 - You have a user in your main server, and you remove them from the server, or they leave the main server. All roles that the user has in the main server are removed from the user in all additional synced servers. 
   - example: Jim is part of the mainserver and has role1, and role2, when Jim is kicked, or leaves the mainserver, but stays in any additional servers, he will no longer have role1 or role2 in any additional server. He also will not have role1 or role2 upon rejoining the mainserver until they are given back to him.

## Use Cases - Running Reverse SyncBot 
#### (many synced servers feeding roles back to a single main server)
Manual Operations
- Adding Roles
   - You have a user in a synced server, and you use the discord UI to give the user role1, the bot will look up any role named "role1" in the main server and give the user that role in the main server.
   - You have a user in a synced server, and you use the /add command with @role1 @username, the bot will look up the role named "role1" in the main server and give the user that role in the main server.

- Removing Roles
   - You have a user in a synced server, and you use the discord UI to remove role1 from the user, the bot will see if the user exists in the main server, and will remove the role from them there as well.
   - You have a user in a synced server, and you use the /remove command with @role1 @username, the bot will see if the user exists inin the main server, and will remove the role from them there as well.
- Role Verification
   - Your bot has gone down at some point and you don't know what roles each user has in your synced servers.
     - You can run the role-checker command with the analyze option which sends you a file detailing the differences between your users roles in each server.
     - You can run the role-checker command with the force-sync option which will return all users in all synced servers roles to match the main server roles they have.

Automatic Operations
 - You have a user in a synced server, and you invite them to the main server. When the user joins the main server, any roles that they have in a synced server will be applied automatically to them on join of the main server. 
   - example: Jim is part of a synced server and has role1, and then Jim joins the main server. Jim automatically has role1 upon joining the main server.
 - You have a user a synced server, and you remove them from the synced server, or they leave the synced server. All roles that the user has in the synced server are removed from the user in the main server. 
   - example: Jim is part of a synced server and has role1, and role2 there, when Jim is kicked, or leaves that synced server, but stays in the main server, he will no longer have role1 or role2 in the main server. He also will not have role1 or role2 upon rejoining the mainserver until they are given back to him in a synced server.

## Installing
- requirements :
    - node v16.11.1 
    - discord.js v13.2.0
- example install :
    - cd /Documents
    - git clone https://github.com/jonathonor/syncBot.git
    - cd syncBot
    - npm install discord.js @discordjs/rest discord-api-types axios 
    - follow the config steps at [SyncBot Config Documentation](https://jonsbots.com/syncbot/#aioseo-explain-config-file) to populate the config.json file before executing the next two commands

- To start regular sync bot
  - node register.js (this registers the /add /remove and /role-checker slash commands for your main server)
  - node run.js
    
- To start regular sync bot
  - node registerGlobal.js (this registers the /add /remove and /role-checker slash commands for all your servers)
  - node runReverse.js
<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/jonathonor/syncbot.svg?style=for-the-badge
[contributors-url]: https://github.com/jonathonor/syncbot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jonathonor/syncbot.svg?style=for-the-badge
[forks-url]: https://github.com/jonathonor/syncbot/network/members
[stars-shield]: https://img.shields.io/github/stars/jonathonor/syncbot.svg?style=for-the-badge
[stars-url]: https://github.com/jonathonor/syncbot/stargazers
[issues-shield]: https://img.shields.io/github/issues/jonathonor/syncbot.svg?style=for-the-badge
[issues-url]: https://github.com/jonathonor/syncbot/issues
[license-shield]: https://img.shields.io/github/license/jonathonor/syncbot.svg?style=for-the-badge
[license-url]: https://github.com/jonathonor/syncbot/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
