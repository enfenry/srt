README:
modifySrt function will take an input.srt file, change specified subtitle times based on a new time provided as an argument.

ARG 1: NEW START TIME
First argument passed is the new start time for the subtitle. 
This will modify all of the following subtitles based on the delta or offset between the time provided and the subtitle's current time in the input.srt file.
e.g. 'node srtConverter.js 00:00:49,111' used on an input.srt whose subtitle at line number 1 is '00:01:19,111'
will change all subtitle start and end times to be 30 seconds earlier (each subtitle remaining the same length).
2 Formats are available: 
  passing in terms of milliseconds e.g. '00:00:41,700' 
  or in terms of 24fps timecode (as displayed in Premiere Pro) e.g. '00:00:41:17'
TODO - should make 30fps timecode an available format. This will require an additional argument to clarify which fps is being used.

ARG 2: LINE NUMBER (OPTIONAL)
Second argument passed is which line number to start modifying subtitle times at. 
The line number here refers to the numbered line above a subtitle's start and end time in an .srt, for example:
    1
    00:01:19,111 --> 00:01:20,646
    That's the cleanup crew

    2
    00:01:20,679 --> 00:01:22,647
    up on the track,
    and that's a lot of racers

Not providing will assume a line number of 1, so the delta or offset will be calculated based on the difference between the new time provided in ARG 1 and
the first subtitle's start time.
Passing a line number will calculate the delta between the new time provided and the subtitle's start time at that line
e.g. 'node srtConverter.js 00:00:49,111 2' based on the above example will leave line number 1 alone and return:

    1
    00:01:19,111 --> 00:01:20,646
    That's the cleanup crew

    2
    00:00:49,111 --> 00:00:51,079
    up on the track,
    and that's a lot of racers

    3
    00:00:51,113 --> 00:00:53,882
    involved there, folks.