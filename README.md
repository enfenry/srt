# srt
Repository for several node scripts to deal with SRT files (useful for fan-editing/adding subtitles to foreign shows, etc.).
Best used in conjunction with Notepad++.

## srtConverter
Use this once you've made a rough pass at creating an SRT file to match your video. This will let you adjust the times of lines of dialogue and keep everything in relation to each other.

For instance, let's say you made a pass and you notice while watching at the 7-minute mark that every line is .5 seconds late. This script lets you enter a new time for that first line of dialogue at the 7-minute mark that is .5 seconds earlier, and will adjust all the following lines by .5 seconds.

If you only need to edit one line, manually editing an SRT file is either, but let's say you only had that problem from minutes 7 to 13. You could do the first step, then go to the 13 minute mark, and repeat the process, but adding a time that is .5 seconds later, so that everything lines back up after minute 13.

## srtCropper
Use this to get a new SRT file that only consists of lines x through y. Mainly useful for very large SRT files that literally take minutes to scroll through in Notepad++, for instance.