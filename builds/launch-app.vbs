' File Viewer Application Launcher
' VBScript for Windows that starts the application

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where the script is located
scriptPath = WScript.ScriptFullName
scriptDir = objFSO.GetParentFolderName(scriptPath)

' Change to script directory
objShell.CurrentDirectory = scriptDir

' Check if Python is available
Set objExec = objShell.Exec("cmd /c where python")
Set objOutput = objExec.StdOut
pythonPath = objOutput.ReadLine()

If pythonPath <> "" Then
    ' Start Python HTTP server
    objShell.Run "cmd /c start http://localhost:8888 && python -m http.server 8888 --directory dist", 0, False
Else
    ' Try Node.js
    Set objExec = objShell.Exec("cmd /c where node")
    Set objOutput = objExec.StdOut
    nodePath = objOutput.ReadLine()
    
    If nodePath <> "" Then
        ' Start with Node.js http-server
        objShell.Run "cmd /c start http://localhost:8888 && npx http-server dist -p 8888", 0, False
    Else
        ' Open index.html directly
        indexPath = scriptDir & "\dist\index.html"
        objShell.Run "cmd /c start " & indexPath, 0, False
    End If
End If
