@echo off
setlocal enabledelayedexpansion

echo {
echo   "rawData": [

set names=Juan Maria Luis Ana Carlos Elena Diego Sofia Jose Laura
set lastnames=Perez Garcia Torres Ruiz Lopez Sanchez Gomez Diaz
set careers=Sistemas Industrial Civil

for /L %%i in (1,1,100) do (
    set /a code=1000 + %%i
    set /a grade=!RANDOM! %% 11 + 10
    
    set /a r1=!RANDOM! %% 10
    set /a r2=!RANDOM! %% 8
    set /a r3=!RANDOM! %% 3

    call :getItem "!names!" !r1! fname
    call :getItem "!lastnames!" !r2! lname
    call :getItem "!careers!" !r3! career
    
    echo     {
    echo       "codigo": !code!,
    echo       "nombre": "!fname! !lname!",
    echo       "carrera": "!career!",
    echo       "nota": !grade!
    
    if %%i lss 100 (
        echo     },
    ) else (
        echo     }
    )
)
echo   ]
echo }
goto :eof

:getItem
set list=%~1
set index=%2
set %3=

set /a _pos=0
for %%a in (%list%) do (
   if !_pos! equ %index% (
      set %3=%%a
      goto :eof
   )
   set /a _pos+=1
)

goto :eof
