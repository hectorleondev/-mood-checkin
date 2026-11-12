# Notes

## Issues found in AI output

### first prompt

1.- What happen if someone set an invalid value for Score?
As score is only IntegerField can set any value out range (1-10)

2.-What fields are required in MoodCheckIn?
All fields are not required

3.-Does it conflict with anything that Django already include?
Django include own Users model, it is totally unnecessary create new one

4.- what bussiness rule is missing?
User only can register one check in per day

### second prompt

5.- what timezone of created_at?
I think created_at as datetime when record is created in Server for logging

6.- What is propose of Timezone?
You are right I am mixing frontend date with server date. Timezone must be removed

7.- where is reference .clean?
nowhere

