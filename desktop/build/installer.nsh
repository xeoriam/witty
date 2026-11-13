; Witty installer tweaks.
;
; electron-builder's own shortcuts have no arguments, but this app needs
; `--no-sandbox` on the command line (Chromium's sandbox cannot start on some
; Windows machines, and setting the switch from inside the app is too late).
; Shortcut creation is therefore disabled in package.json and done here, and the
; uninstaller removes exactly these files.

!macro customInstall
  CreateShortCut "$DESKTOP\Witty.lnk" "$INSTDIR\Witty.exe" "--no-sandbox" "$INSTDIR\Witty.exe" 0
  CreateShortCut "$SMPROGRAMS\Witty.lnk" "$INSTDIR\Witty.exe" "--no-sandbox" "$INSTDIR\Witty.exe" 0
!macroend

!macro customUnInstall
  Delete "$DESKTOP\Witty.lnk"
  Delete "$SMPROGRAMS\Witty.lnk"
!macroend
