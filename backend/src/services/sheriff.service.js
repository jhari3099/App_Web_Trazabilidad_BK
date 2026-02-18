import axios from 'axios';

class SheriffService {
  constructor() {
    this.apiUrl = process.env.SHERIFF_API_URL;
    this.apiKey = process.env.SHERIFF_API_KEY;
  }

  async consultarRUC(ruc) {
    try {
      // Ejemplo de integración con API Sheriff
      // Ajustar según la documentación real de la API
      const response = await axios.get(`${this.apiUrl}/consulta`, {
        params: { ruc },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error consultando API Sheriff:', error.message);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // La API respondió con un código de error
        return {
          success: false,
          error: error.response.data,
          statusCode: error.response.status
        };
      } else if (error.request) {
        // No hubo respuesta
        return {
          success: false,
          error: 'No se recibió respuesta de la API Sheriff',
          statusCode: 503
        };
      } else {
        // Error en la configuración
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }
    }
  }

  // Método mock para desarrollo/pruebas
  async consultarRUCMock(ruc) {
    // Simular delay de API real
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        ruc: ruc,
        razon_social: 'EMPRESA EJEMPLO SAC',
        estado: 'ACTIVO',
        condicion: 'HABIDO',
        direccion: 'AV. PRINCIPAL 123 - LIMA',
        departamento: 'LIMA',
        provincia: 'LIMA',
        distrito: 'SAN ISIDRO',
        tipo_contribuyente: 'SOCIEDAD ANONIMA CERRADA',
        fecha_inscripcion: '2010-05-15',
        sistema_emision_comprobante: 'FACTURADOR ELECTRONICO',
        actividad_comercial: 'VENTA AL POR MAYOR DE OTROS PRODUCTOS',
        telefono: '01-2345678',
        reportes_credito: {
          score: 750,
          calificacion: 'A',
          deuda_total: 150000,
          protestos: 0,
          demandas: 0,
          morosidad: false
        },
        antecedentes: {
          judiciales: false,
          comerciales: false,
          tributarios: false
        },
        informacion_financiera: {
          ventas_anuales: 5000000,
          activos: 3000000,
          patrimonio: 1500000
        }
      }
    };
  }
}

export default new SheriffService();
