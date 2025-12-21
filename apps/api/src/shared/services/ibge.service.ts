/**
 * Serviço de integração com API do IBGE
 *
 * Fornece dados de localidades brasileiras:
 * - Estados (UF)
 * - Municípios por estado
 * - Distritos e subdistritos (se disponível)
 */

import axios from 'axios';

const IBGE_API_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades';

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface Municipio {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
        regiao: {
          id: number;
          sigla: string;
          nome: string;
        };
      };
    };
  };
}

export interface Distrito {
  id: number;
  nome: string;
  municipio: {
    id: number;
    nome: string;
    microrregiao: {
      mesorregiao: {
        UF: {
          sigla: string;
          nome: string;
        };
      };
    };
  };
}

class IBGEService {
  /**
   * Busca todos os estados brasileiros
   */
  async getEstados(): Promise<Estado[]> {
    try {
      const response = await axios.get<Estado[]>(`${IBGE_API_URL}/estados`, {
        params: {
          orderBy: 'nome'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estados do IBGE:', error);
      throw new Error('Erro ao buscar estados');
    }
  }

  /**
   * Busca municípios de um estado específico
   * @param uf Sigla do estado (ex: SP, RJ, MG)
   */
  async getMunicipiosByEstado(uf: string): Promise<Municipio[]> {
    try {
      const response = await axios.get<Municipio[]>(
        `${IBGE_API_URL}/estados/${uf.toUpperCase()}/municipios`,
        {
          params: {
            orderBy: 'nome'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar municípios do estado ${uf}:`, error);
      throw new Error(`Erro ao buscar municípios de ${uf}`);
    }
  }

  /**
   * Busca distritos de um município específico
   * @param municipioId ID do município
   */
  async getDistritosByMunicipio(municipioId: number): Promise<Distrito[]> {
    try {
      const response = await axios.get<Distrito[]>(
        `${IBGE_API_URL}/municipios/${municipioId}/distritos`,
        {
          params: {
            orderBy: 'nome'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar distritos do município ${municipioId}:`, error);
      return []; // Retorna array vazio se não houver distritos
    }
  }

  /**
   * Busca um estado específico pela sigla
   * @param uf Sigla do estado
   */
  async getEstadoBySigla(uf: string): Promise<Estado | null> {
    try {
      const response = await axios.get<Estado>(
        `${IBGE_API_URL}/estados/${uf.toUpperCase()}`
      );

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar estado ${uf}:`, error);
      return null;
    }
  }

  /**
   * Busca municípios que correspondem a um termo de busca
   * @param termo Termo de busca
   * @param uf Opcional: filtrar por estado
   */
  async searchMunicipios(termo: string, uf?: string): Promise<Municipio[]> {
    try {
      let url = `${IBGE_API_URL}/municipios`;

      if (uf) {
        url = `${IBGE_API_URL}/estados/${uf.toUpperCase()}/municipios`;
      }

      const response = await axios.get<Municipio[]>(url);

      // Filtrar por termo de busca
      const termoLower = termo.toLowerCase();
      return response.data.filter(mun =>
        mun.nome.toLowerCase().includes(termoLower)
      );
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      return [];
    }
  }

  /**
   * Formata dados de localização para exibição
   */
  formatLocalizacao(estado?: string, municipio?: string, bairro?: string): string {
    const partes = [];

    if (bairro) partes.push(bairro);
    if (municipio) partes.push(municipio);
    if (estado) partes.push(estado);

    return partes.join(', ');
  }

  /**
   * Valida UF brasileira
   */
  isValidUF(uf: string): boolean {
    const ufsValidas = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    return ufsValidas.includes(uf.toUpperCase());
  }
}

// Singleton
export const ibgeService = new IBGEService();
