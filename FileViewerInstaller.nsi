; File Viewer Installer
; NSIS Installer Script for Windows 7, 8, 10, 11

!include "MUI2.nsh"
!include "x64.nsh"

; Name and file
Name "File Viewer"
OutFile "File-Viewer-Setup-1.0.0.exe"

; Default installation folder
InstallDir "$PROGRAMFILES\File Viewer"

; Request admin privileges
RequestExecutionLevel admin

; MUI Settings
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

; Installer sections
Section "Install"
  SetOutPath "$INSTDIR"

  ; Copy application file
  File "dist\File Viewer"

  ; Copy web assets
  SetOutPath "$INSTDIR\dist"
  File /r "dist\*.*"

  ; Create shortcuts
  SetOutPath "$SMPROGRAMS\File Viewer"
  CreateShortcut "$SMPROGRAMS\File Viewer\File Viewer.lnk" "$INSTDIR\File Viewer"
  CreateShortcut "$DESKTOP\File Viewer.lnk" "$INSTDIR\File Viewer"

  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\FileViewer" "DisplayName" "File Viewer"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\FileViewer" "UninstallString" "$INSTDIR\Uninstall.exe"
SectionEnd

; Uninstaller
Section "Uninstall"
  RMDir /r "$INSTDIR"
  RMDir /r "$SMPROGRAMS\File Viewer"
  Delete "$DESKTOP\File Viewer.lnk"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\FileViewer"
SectionEnd
