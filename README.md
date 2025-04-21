# phaseIVteam18

## Tech Stack
### Frontend
- Build Tool: Next.js
- Package Manager: NPM
- Framework: React.js
- UI Library: ShadCN UI

### Backend
- Flask

### Database
- Local MySQL Instance

## Installation & Setup
Clone this repository and open it

### Frontend
- `cd website`
-  `npm install`

### Backend
- `cd server`
- Create / Activate your virtual enviroment
- `pip install -r requirements.txt`

### Database
- Create a user by
  - MySQLWorkbench > Server > Users and Privileges 
  - Click `Add Account`
    - Login Name: `python`
    - Limit to Hosts Matching: `localhost`
    - Administrative roles: DBA
- Make sure database instance running on port 3306

## Running
### Frontend
- `cd website`
- `npm run dev`

### Backend
- `cd server`
- `python run.py`

## Database
- Open up your MySQL instance and run SQL files located in `/sql`

***You must have all the above running locally for this application to work***

### Work Split
- Vincent: Frontend, small bit of backend, initial setup
