# Had🐍 
_https://github.com/vok0bere/hadmp_



## O co jde?
Ve zkratce **Snake** pro více hráčů. Stačí se připojit a hrát! Hra v levém rohu průběžně udržuje **skóre** jednotlivých hráčů. Každý hráč si volí **vlastní jméno** a také si může zvolit **barvu** svého hada. Jak se hra vypořádává s ***kolizemi***? Pokud váš had narazí hlavou _(prvním článkem)_ do ocasu _(všechny další články)_ jiného hada, váš had umírá a začínáte od znova. Pokud se však váš had srazí hlavičkou s hlavičkou jiného hada, umírá had s méně body. Každou z těchto životních událostí _(smrt, zabití, jezení)_ doprovází zvukový efekt. Uživatel má možnost zapnout si i **hudbu** do pozadí, a to kliknutím na trubku v pravém rohu. Hra funguje i na mobilních zařízeních s dostatečným rozlišením.



## Technologie
Backend: Node.js + Express.js, Socket.io
Frontend: Hammer.js _(mobilní gesta)_, Howler.js _(zvukové efekty)_, Socket.io



## Instalace
```
git clone **https://github.com/vok0bere/hadmp.git**
npm i
nastavení proměnných v **/game/settings.js**
node app.js
[your.ip.address:8080]
```
