IAT + Word Association Task
=========================

Author of this version: Bram Van Rensbergen (mail@bramvanrensbergen.com) 

Source: https://github.com/BramVanRensbergen/IAT


<b>Based on the IAT by Winter Mason</b><br>
Source: https://github.com/winteram/IAT<br>
Authors:
<ul><li>Winter Mason (m@winteram.com)</li>
<li>Steven Allon</li> 
<li>Pinar Ozturk</li>
</ul>

<b>About</b><br>
This is a modified version of the open-source, web-based IAT by Winter Mason. The most important change is the addition of a word association task, prior to the IAT.

See https://github.com/winteram/IAT or README_IAT for more information about the original version, and instructions and requirements for this task.

This version was made for personal use, but anyone can use or modify it.

Major differences between this version, and the original:
* Added a word association task, which asks participants for three associations to a number of words. 
   -Configuration in /core/js/associations.js<br>
   -You will need to add the cues for this task in this file manually.<br>
   -You can turn off the module in /core/js/iat.js, though if you are not interested in the association task, you will probably be better off with the original IAT by Mason.<br>
   -No GUI is provided to configure this module (nor will there be one)<br>
* Translated all instructions to Dutch
* Asked for some additional participant information
* Some layout changes to the instructions
* Other minor changes
        
If you use an IAT with images, you might have to alter the instructions. 
Likewise, if you turn off the association task, you will need to modify the instructions (they are written under the assumption that participants completed a task prior to the IAT)