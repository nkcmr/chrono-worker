chrono: a natural language date parser in as an api.

usage
=====

get the timestamp of some vague reference to a future point in time:
```
GET https://chrono.nkcmr.dev/parse-date?text=in%204%20days%20at%208am

{"result":"2021-05-09T08:00:00.000Z","tz":"UTC"}
```

make the result be a certain timezone:
```
GET https://chrono.nkcmr.dev/parse-date?text=in%204%20days%20at%208am&tz=America/New_York

{"result":"2021-05-09T04:00:00.000-04:00","tz":"America/New_York"}
```
