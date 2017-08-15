# open-gtfs-map

copyright &copy; 2017 Naomi 'Nome' Dickerson

Open GTFS Map generates stylized SVG transit maps from GTFS data. This purpose of this application is to automate the creation of interactive maps like the one found on the [Mendocino Transit Authority homepage](http://mendocinotransit.org/). Although there are a number of excellent resources for mapping GTFS data, such as the Google Transit API and Open Streetmap, there are instances when a simplified visualization is preferable to an accurate one.

I have primarily created this software to help me automate a task at work I dislike (generating interactive SVG maps), but hope it can prove useful or interesting for anyone looking to visualize transit routes or work with GTFS data. Open GTFS Map runs a Node/Express server and web application which can process any standard GTFS feed with an accessible download URL.

This is currently a work in progress and has not been extensively tested. 

## Installation

open-gtfs-map requires Node 8.0.x, Express 4.0.x, and npm. It has not been tested on lower versions.

- Install dependencies from application directory with `npm install`

## Running Instructions

- Run express server on port 3000 with `npm start`
- Run in development mode with `npm run-script devstart` (uses nodemon to refresh server on code change)
- Navigate to `localhost:3000` to enter a GTFS Feed URL and generate an SVG map

## Development & Contribution

Submit bugs and feature requests in the GitHub issue tracker. 

This code is currently under a major restructuring to move much of the processing to the front-end in order to allow improved interactivity. New work can be found under the `restructure` branch. The goal of this development shift is to allow the user to adjust such factors as the magnitude of path simplification and the number of stops shown on the map in real time. The master branch contains the most recent stable implementation of the original code structure.

## Week 3 Report
I have perhaps been ambitious in learning a new framework for this project. Thus far I have:
- Completed several node js tutorials/practice projects at https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs and https://nodeschool.io/
- Started planning project with classic pen and paper
- Made overall structural and strategic decisions
- Thinkin' bout data structures 
- Built skeleton, basic site structure with Express framework and Node JS
- Created infrastructure for error-handling

## License 

This code is maintained under the MIT license. See LICENSE for more information.
