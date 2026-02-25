import json
import sys

def transform_data():
    try:
        # Intentamos leer desde el primer argumento, si no, desde el flujo de entrada (stdin)
        if len(sys.argv) > 1:
            input_text = sys.argv[1]
        else:
            input_text = sys.stdin.read()

        # 1. Convertir el texto a diccionarios y listas
        data = json.loads(input_text)
        
        # Accedemos al campo rawData
        raw_list = data.get("rawData", [])
        
        # 2. Transformar y filtrar: Solo carrera "Sistemas" y campos específicos
        cleaned_list = []
        for alumno in raw_list:
            if alumno.get("carrera") == "Sistemas":
                # Creamos el nuevo objeto solo con nombre y nota
                nuevo_alumno = {
                    "nombre": alumno.get("nombre"),
                    "nota": alumno.get("nota")
                }
                cleaned_list.append(nuevo_alumno)
        
        # 3. Crear el objeto JSON de salida
        output = {
            "cleanedData": cleaned_list
        }
        
        # Pintar el resultado en la salida estándar
        print(json.dumps(output, indent=2, ensure_ascii=False))

    except json.JSONDecodeError:
        print(json.dumps({"error": "Formato JSON inválido"}, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))

if __name__ == "__main__":
    transform_data()
