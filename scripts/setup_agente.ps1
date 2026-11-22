# Instalacion de una via para la capa de agente (b) de Rally Studio.
#
# Deja listas las skills para OpenCode y Antigravity, declara el MCP de
# Playwright en opencode.json y verifica que el servidor local arranca.
#
# Es idempotente: correrlo dos veces no cambia nada la segunda vez.
#
# Uso:
#   .\scripts\setup_agente.ps1
#   .\scripts\setup_agente.ps1 -SinDependencias
#   .\scripts\setup_agente.ps1 -SinVerificarServidor

[CmdletBinding()]
param(
    [switch]$SinDependencias,
    [switch]$SinVerificarServidor
)

$ErrorActionPreference = "Stop"

$Raiz = Split-Path -Parent $PSScriptRoot
Set-Location $Raiz

$Resumen = New-Object System.Collections.Generic.List[string]

function Anotar([string]$texto) {
    $Resumen.Add($texto) | Out-Null
    Write-Host $texto
}

Write-Host ""
Write-Host "Rally Studio - instalacion de la capa de agente (b)"
Write-Host "Carpeta: $Raiz"
Write-Host ""

# ---------------------------------------------------------------------------
# 1. Python
# ---------------------------------------------------------------------------
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Anotar "ERROR: no encontre Python en PATH. Instalalo (3.10 o superior) y marca 'Add Python to PATH'."
    exit 1
}

$versionTexto = & python -c "import sys; print('%d.%d' % sys.version_info[:2])"
$partes = $versionTexto.Trim().Split(".")
$mayor = [int]$partes[0]
$menor = [int]$partes[1]
if ($mayor -lt 3 -or ($mayor -eq 3 -and $menor -lt 10)) {
    Anotar "ERROR: Python $versionTexto es demasiado viejo. Se necesita 3.10 o superior."
    exit 1
}
Anotar "OK Python $versionTexto"

# ---------------------------------------------------------------------------
# 2. Dependencias
# ---------------------------------------------------------------------------
if ($SinDependencias) {
    Anotar "OMITIDO requirements.txt (pedido con -SinDependencias)"
} else {
    Write-Host "Instalando requirements.txt..."
    Write-Host "  (los opcionales pesados NO se instalan: easyocr, chatterbox-tts, kokoro, ffmpeg)"
    & python -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Anotar "ERROR: fallo la instalacion de requirements.txt (codigo $LASTEXITCODE)."
        exit 1
    }
    Anotar "OK dependencias de requirements.txt"
}

# ---------------------------------------------------------------------------
# 3. Skills: una fuente, dos destinos
# ---------------------------------------------------------------------------
$destinos = @(".opencode\skills", ".agents\skills")
foreach ($destino in $destinos) {
    if (-not (Test-Path $destino)) {
        New-Item -ItemType Directory -Path $destino -Force | Out-Null
        Anotar "OK creada carpeta $destino"
    }
}

$carpetasSkills = @(Get-ChildItem -Path "skills" -Directory -ErrorAction SilentlyContinue)
if ($carpetasSkills.Count -eq 0) {
    Anotar "AVISO: no hay skills en skills\. Nada que reflejar."
} else {
    foreach ($skill in $carpetasSkills) {
        $objetivo = $skill.FullName
        foreach ($destino in $destinos) {
            $enlace = Join-Path $destino $skill.Name
            $yaEsta = $false

            if (Test-Path $enlace) {
                $item = Get-Item $enlace -Force
                if ($item.LinkType -eq "Junction") {
                    $actual = @($item.Target)[0]
                    $actualAbs = $null
                    try { $actualAbs = (Resolve-Path $actual).Path } catch { $actualAbs = $null }
                    if ($actualAbs -and ($actualAbs -eq $objetivo)) {
                        Anotar "OK $enlace ya apunta a skills\$($skill.Name)"
                        $yaEsta = $true
                    } else {
                        # Borrar SOLO el enlace, nunca el contenido del destino.
                        [System.IO.Directory]::Delete($enlace, $false)
                    }
                } else {
                    Remove-Item -Recurse -Force $enlace
                }
            }

            if (-not $yaEsta) {
                try {
                    New-Item -ItemType Junction -Path $enlace -Target $objetivo -ErrorAction Stop | Out-Null
                    Anotar "OK junction $enlace -> skills\$($skill.Name)"
                } catch {
                    Copy-Item -Recurse -Force $objetivo $enlace
                    Anotar "OK copia $enlace (junction no disponible en este sistema)"
                }
            }
        }
    }
}

# ---------------------------------------------------------------------------
# 4. MCP de Playwright en opencode.json (sin borrar MCPs existentes)
# ---------------------------------------------------------------------------
$cfgPath = "opencode.json"

if (Test-Path $cfgPath) {
    $raw = Get-Content $cfgPath -Raw -Encoding UTF8
    if ($raw.Trim()) {
        try {
            $cfg = $raw | ConvertFrom-Json
        } catch {
            Anotar "ERROR: opencode.json no es JSON valido ($($_.Exception.Message)). Corregilo a mano, o borralo para que este instalador lo regenere, y volve a correr el script."
            exit 1
        }
        if ($null -eq $cfg -or $cfg -isnot [System.Management.Automation.PSCustomObject]) {
            Anotar "ERROR: opencode.json debe contener un objeto JSON en la raiz. Corregilo a mano o borralo para regenerarlo."
            exit 1
        }
    } else {
        $cfg = New-Object PSObject
    }
} else {
    $cfg = New-Object PSObject
    $cfg | Add-Member -NotePropertyName '$schema' -NotePropertyValue "https://opencode.ai/config.json"
}

if (-not ($cfg.PSObject.Properties.Name -contains "mcp")) {
    $cfg | Add-Member -NotePropertyName "mcp" -NotePropertyValue (New-Object PSObject)
}

# Un `"mcp": null` o un `mcp` que no es objeto es JSON valido, y hasta ahora
# reventaba con una excepcion de Add-Member. Se reemplaza por un objeto vacio.
if ($null -eq $cfg.mcp -or $cfg.mcp -isnot [System.Management.Automation.PSCustomObject]) {
    $cfg | Add-Member -NotePropertyName "mcp" -NotePropertyValue (New-Object PSObject) -Force
    Anotar "AVISO: la clave mcp de opencode.json no era un objeto; se reemplazo por uno vacio."
}

# Declarar un MCP no es tenerlo: lo que decide es `enabled`. El servidor que
# declara el agente tiene que quedar habilitado, y blender queda apagado hasta
# autorizacion explicita (regla de la caja de herramientas).
function AsegurarMcp($config, [string]$nombre, [string[]]$comando, [bool]$habilitado) {
    $cambiado = $false
    if (-not ($config.mcp.PSObject.Properties.Name -contains $nombre)) {
        $nuevo = New-Object PSObject
        $nuevo | Add-Member -NotePropertyName "type" -NotePropertyValue "local"
        $nuevo | Add-Member -NotePropertyName "command" -NotePropertyValue $comando
        $nuevo | Add-Member -NotePropertyName "enabled" -NotePropertyValue $habilitado
        $config.mcp | Add-Member -NotePropertyName $nombre -NotePropertyValue $nuevo
        return $true
    }
    $actual = $config.mcp.$nombre
    if ($null -eq $actual -or $actual -isnot [System.Management.Automation.PSCustomObject]) {
        $nuevo = New-Object PSObject
        $nuevo | Add-Member -NotePropertyName "type" -NotePropertyValue "local"
        $nuevo | Add-Member -NotePropertyName "command" -NotePropertyValue $comando
        $nuevo | Add-Member -NotePropertyName "enabled" -NotePropertyValue $habilitado
        $config.mcp | Add-Member -NotePropertyName $nombre -NotePropertyValue $nuevo -Force
        return $true
    }
    if ($actual.enabled -ne $habilitado) {
        $actual | Add-Member -NotePropertyName "enabled" -NotePropertyValue $habilitado -Force
        $cambiado = $true
    }
    return $cambiado
}

$cambioMcp = $false
if (AsegurarMcp $cfg "playwright" @("npx", "-y", "@playwright/mcp") $true) {
    $cambioMcp = $true
    Anotar "OK MCP playwright declarado y habilitado en opencode.json"
} else {
    Anotar "OK MCP playwright ya declarado y habilitado en opencode.json"
}

if (AsegurarMcp $cfg "blender-mcp" @("uvx", "blender-mcp") $false) {
    $cambioMcp = $true
    Anotar "OK MCP blender-mcp declarado y desactivado (se activa solo con autorizacion)"
} else {
    Anotar "OK MCP blender-mcp ya declarado y desactivado"
}

if ($cambioMcp) {
    $cfg | ConvertTo-Json -Depth 10 | Set-Content -Path $cfgPath -Encoding UTF8
}

# ---------------------------------------------------------------------------
# 4b. Skills externas obligatorias (impeccable)
# ---------------------------------------------------------------------------
# impeccable es obligatoria: es la que exige preguntar antes de suponer en el
# diseno de identidad. Sin red, la instalacion avisa y sigue: no aborta nada.
if ($SinDependencias) {
    Anotar "OMITIDO skills externas (pedido con -SinDependencias)"
} else {
    & python scripts/herramientas.py instalar impeccable --si
    if ($LASTEXITCODE -eq 0) {
        Anotar "OK impeccable instalada (obligatoria: pregunta antes de suponer)"
    } else {
        Anotar "AVISO: no se pudo instalar impeccable (sin red o sin npx). Reintentar: python scripts/herramientas.py instalar impeccable --si"
    }
}

# ---------------------------------------------------------------------------
# 5. El servidor arranca
# ---------------------------------------------------------------------------
if ($SinVerificarServidor) {
    Anotar "OMITIDO arranque del servidor (pedido con -SinVerificarServidor)"
} else {
    $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 0)
    $listener.Start()
    $puerto = $listener.LocalEndpoint.Port
    $listener.Stop()

    $env:RALLY_SERVICE_PORT = "$puerto"
    $proc = Start-Process -FilePath "python" -ArgumentList "scripts/rally_service.py" -PassThru -WindowStyle Hidden

    $responde = $false
    try {
        for ($i = 0; $i -lt 40; $i++) {
            Start-Sleep -Milliseconds 500
            try {
                $r = Invoke-WebRequest -Uri "http://127.0.0.1:$puerto/health" -UseBasicParsing -TimeoutSec 2
                if ($r.StatusCode -eq 200) {
                    $responde = $true
                    break
                }
            } catch {
                # todavia arrancando
            }
        }
    } finally {
        if ($proc -and -not $proc.HasExited) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
        Remove-Item Env:\RALLY_SERVICE_PORT -ErrorAction SilentlyContinue
    }

    if ($responde) {
        Anotar "OK el servidor responde en /health (puerto $puerto)"
    } else {
        Anotar "AVISO: el servidor no respondio en 20 s. Probalo a mano: python scripts/rally_service.py"
    }
}

# ---------------------------------------------------------------------------
# 6. Resumen
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "Resumen"
Write-Host "-------"
foreach ($linea in $Resumen) {
    Write-Host "  $linea"
}
Write-Host ""
Write-Host "Listo. Abri esta carpeta con OpenCode o Antigravity y la IA ya sabe que hacer."
Write-Host "Guia completa: docs\INSTALACION_AGENTE.md"
Write-Host ""
