/**
 * Rotas para dados de localidades (IBGE)
 *
 * Endpoints públicos para buscar estados, municípios e distritos
 */

import { FastifyInstance } from 'fastify';
import { ibgeService } from '../../shared/services/ibge.service';

export async function localidadesRoutes(server: FastifyInstance) {
  /**
   * GET /api/v1/localidades/estados
   * Retorna todos os estados brasileiros
   */
  server.get('/estados', async (request, reply) => {
    try {
      const estados = await ibgeService.getEstados();

      return {
        success: true,
        data: estados
      };
    } catch (error: any) {
      server.log.error('Erro ao buscar estados:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar estados',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/localidades/estados/:uf
   * Retorna dados de um estado específico
   */
  server.get<{ Params: { uf: string } }>(
    '/estados/:uf',
    async (request, reply) => {
      try {
        const { uf } = request.params;

        if (!ibgeService.isValidUF(uf)) {
          return reply.status(400).send({
            error: 'UF inválida',
            message: 'A sigla do estado fornecida não é válida'
          });
        }

        const estado = await ibgeService.getEstadoBySigla(uf);

        if (!estado) {
          return reply.status(404).send({
            error: 'Estado não encontrado'
          });
        }

        return {
          success: true,
          data: estado
        };
      } catch (error: any) {
        server.log.error('Erro ao buscar estado:', error);
        return reply.status(500).send({
          error: 'Erro ao buscar estado',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/localidades/estados/:uf/municipios
   * Retorna municípios de um estado
   */
  server.get<{ Params: { uf: string } }>(
    '/estados/:uf/municipios',
    async (request, reply) => {
      try {
        const { uf } = request.params;

        if (!ibgeService.isValidUF(uf)) {
          return reply.status(400).send({
            error: 'UF inválida',
            message: 'A sigla do estado fornecida não é válida'
          });
        }

        const municipios = await ibgeService.getMunicipiosByEstado(uf);

        return {
          success: true,
          data: municipios
        };
      } catch (error: any) {
        server.log.error('Erro ao buscar municípios:', error);
        return reply.status(500).send({
          error: 'Erro ao buscar municípios',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/localidades/municipios/:id/distritos
   * Retorna distritos de um município
   */
  server.get<{ Params: { id: string } }>(
    '/municipios/:id/distritos',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const municipioId = parseInt(id);

        if (isNaN(municipioId)) {
          return reply.status(400).send({
            error: 'ID inválido',
            message: 'O ID do município deve ser um número'
          });
        }

        const distritos = await ibgeService.getDistritosByMunicipio(municipioId);

        return {
          success: true,
          data: distritos
        };
      } catch (error: any) {
        server.log.error('Erro ao buscar distritos:', error);
        return reply.status(500).send({
          error: 'Erro ao buscar distritos',
          message: error.message
        });
      }
    }
  );

  /**
   * GET /api/v1/localidades/municipios/search?termo=...&uf=...
   * Busca municípios por termo
   */
  server.get<{
    Querystring: { termo: string; uf?: string };
  }>('/municipios/search', async (request, reply) => {
    try {
      const { termo, uf } = request.query;

      if (!termo || termo.trim().length < 2) {
        return reply.status(400).send({
          error: 'Termo de busca inválido',
          message: 'O termo de busca deve ter pelo menos 2 caracteres'
        });
      }

      if (uf && !ibgeService.isValidUF(uf)) {
        return reply.status(400).send({
          error: 'UF inválida',
          message: 'A sigla do estado fornecida não é válida'
        });
      }

      const municipios = await ibgeService.searchMunicipios(termo, uf);

      return {
        success: true,
        data: municipios,
        total: municipios.length
      };
    } catch (error: any) {
      server.log.error('Erro ao buscar municípios:', error);
      return reply.status(500).send({
        error: 'Erro ao buscar municípios',
        message: error.message
      });
    }
  });
}
