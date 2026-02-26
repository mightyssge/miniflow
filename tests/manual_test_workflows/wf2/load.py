import json
import sys
import os

def generate_report():
    try:
        # Leemos el JSON desde el pipe (stdin)
        input_data = sys.stdin.read()
        
        if not input_data.strip():
            print("Error: No se recibieron datos.")
            return

        # 1. Convertir el texto a diccionario
        data = json.loads(input_data)
        
        # 2. Extraer la lista cleanedData
        alumnos = data.get("cleanedData", [])
        
        # 3. Guardar en reporte.txt
        with open("reporte.txt", "w", encoding="utf-8") as f:
            f.write("REPORTE DE ALUMNOS DE SISTEMAS\n")
            f.write("=" * 30 + "\n")
            f.write(f"{'NOMBRE':<20} | {'NOTA':<5}\n")
            f.write("-" * 30 + "\n")
            
            for alumno in alumnos:
                nombre = alumno.get("nombre", "N/A")
                nota = alumno.get("nota", 0)
                f.write(f"{nombre:<20} | {nota:<5}\n")
            
            f.write("-" * 30 + "\n")
            f.write(f"Total de alumnos procesados: {len(alumnos)}\n")

        print(f"Éxito: Se ha generado 'reporte.txt' con {len(alumnos)} registros.")

    except json.JSONDecodeError:
        print("Error: El formato de entrada no es un JSON válido.")
    except Exception as e:
        print(f"Error inesperado: {e}")

if __name__ == "__main__":
    generate_report()
