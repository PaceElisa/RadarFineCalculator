
# RadarFineCalculator
<p align="center">
   <img src="./Images/readme_files/logo_.jpeg" height="450px" />
 </p>

<div align="center">
 
[![Postgres](https://img.shields.io/badge/Made%20with-postgres-%23316192.svg?style=plastic&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![NPM](https://img.shields.io/badge/Made%20with-NPM-%23CB3837.svg?style=plastic&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![NodeJS](https://img.shields.io/badge/Made%20with-node.js-6DA55F?style=plastic&logo=node.js&logoColor=white)](https://nodejs.org/en)
[![Express.js](https://img.shields.io/badge/Made%20with-express.js-%23404d59.svg?style=plastic&logo=express&logoColor=%2361DAFB)](https://expressjs.com/it/)
[![JWT](https://img.shields.io/badge/Made%20with-JWT-black?style=plastic&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Visual Studio Code](https://img.shields.io/badge/Made%20with-Visual%20Studio%20Code-0078d7.svg?style=plastic&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/Made%20with-typescript-%23007ACC.svg?style=plastic&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sequelize](https://img.shields.io/badge/Made%20with-Sequelize-52B0E7?style=plastic&logo=Sequelize&logoColor=white)](https://sequelize.org/)
[![Docker](https://img.shields.io/badge/Made%20with-docker-%230db7ed.svg?style=plastic&logo=docker&logoColor=white)](https://www.docker.com/)
[![Postman](https://img.shields.io/badge/Made%20with-Postman-FF6C37?style=plastic&logo=postman&logoColor=white)](https://www.postman.com/)
 
</div>

# Progetto-Programmazione_Avanzata-2024: Creazione backend per la gestione e il calcolo di multe ottenute in autostrada
<p align="center">
   <img src="./Images/readme_files/logo-univpm.png" height="80" />
   <img src="./Images/readme_files/logo-univpm2.png" height="80" />
 </p>
 
    




## Tabella dei Contenuti
- [Introduzione e Specifiche Progetto](#introduzione-e-specifiche-progetto)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Diagrammi UML](#diagrammi-uml)
- [Database](#database)
- [Design Pattern](#design-pattern)
- [Test Postman](#test-postman)
- [Altri Strumenti](#altri-strumenti)
- [Autori](#autori)
- [License](#license)

## Introduzione e Specifiche Progetto
Il progetto RadarFineCalculator, sviluppato per l'esame del corso di Programmazione Avanzata tenuto presso l'Università Politecnica delle Marche(UNIVPM), durante l'anno accademico 2023-2024, realizza un'API per la gestione dei dati. L'obiettivo del progetto consiste nel realizzare un sistema che consenta di gestire il calcolo di eventuali multe a seguito del passaggio di autoveicoli con classi differenti tra diversi varchi autostradali (es. sistema Tutor). Le specifiche prevedono che vengano:
- modellati le tipologie di veicolo che hanno limiti differenti.
- Modellati i varchi che hanno una posizione geografica nota.
- Inseriti i transiti impostando data e ora del passaggio e targa del veicolo lungo una tratta che ha un varco di inizio, un varco di fine ed una distanza.
- Riportate, nel caso di inserimento di transiti, le condizioni metereologiche del varco ovvero se era presente o meno pioggia in modo da ridurre il limite di velocità.
- Generate delle infrazioni per superamento della velocità media tra due varchi limitrofi.
Inoltre, va specificato che un veicolo in un giorno può attraversare diversi varchi / tratte. 

## Installazione

### Requisiti
### Avvio Progetto
### Note

## Configurazione

### Docker  Compose
### Postgres
### Tesseract OCR

<<<<<<< HEAD
## Database e Diagrammi UML
=======
## Database

### Database Schema

## Diagrammi UML
>>>>>>> e5b69b22a3fdd1499c8e3402ebff6d3bb3ce00d4

### Database Schema
Il database è progettato per memorizzare i dati dei veicoli e dei relativi proprietari, i transiti, le infrazioni e le informazioni relative ai varchi. Di seguito è riportato lo schema del database:
![Database diagram](images/readme_files/modello_db.svg)  
* **Utenti** (users): Contiene le informazioni necessarie al login dell'utente come username, password e ruolo.
* **Veicoli** (vehicles): Contiene le informazioni relative ai veicoli come la targa, la tipologia di veicolo e l'utente al quale appartiene.
* **Varchi** (gateways): Contiene i varchi autostradali identificati con il nome dell'autostrada e il chilometro in cui è situato il singolo varco.
* **Tratta** (segments): Memorizza le tratte autostradali in cui è attivo il sistema di controllo della velocità. Ogni tratta è identificata dai varchi di inizio e fine e dalla distanza tra i due (calcolata automaticamente).
* **Transiti** (transits): Registra i transiti di un veicolo attraverso una tratta. Il transito viene creato al momento in cui il veicolo attraversa il primo varco, registrando la data e l'ora di ingresso. Successivamente, quando il veicolo attraversa il varco di uscita, il transito viene aggiornato con la data e l'ora di uscita. In base alle condizioni meteorologiche inserite, viene verificato se il veicolo ha superato i limiti di velocità consentiti, al fine di determinare eventuali infrazioni. Nel caso di inserimento di un transito con un'immagine in input, viene valutata la leggibilità dell'immagine. Se l'immagine è considerata leggibile, vengono inseriti i relativi attributi nel sistema, inclusi il percorso dell'immagine e l'indicazione della sua leggibilità.
* **Limits** (limiti di velocità): Definisce i limiti di velocità in base al tipo di veicolo e alle condizioni meteo.
* **Violations** (multe): Registra le infrazioni dei limiti di velocità rilevate dal sistema. Contiene informazioni come la velocità media rilevata tra i due varchi, l'ammontare della multa, l'ID del transito a cui fa riferimento e la differenza rispetto al limite di velocità consentito. 
* **Payments** (pagamenti): Contiene le informazioni relative ai pagamenti delle multe come l'uuid univoco del pagamento, l'ID della multa a cui fa riferimento e un indicatore sullo stato di pagamento della multa.
### Diagramma Casi D'Uso
### Rotte
### Diagramma Sequenze
### Utilizzo

<<<<<<< HEAD
=======


>>>>>>> e5b69b22a3fdd1499c8e3402ebff6d3bb3ce00d4
## Design Pattern

### Middleware
### Factory
### Singleton
### DAO
### Model View Controller

## Test Postman
## Altri Strumenti

### Generics



## Autori
## License


