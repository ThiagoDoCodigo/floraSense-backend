process.env.SUPABASE_PROJECT_ID = 'dummy-id';

import { PlantsBusiness } from '@/modules/plants/plants.business';
import { PlantsService } from '@/modules/plants/plants.service';
import { Plant } from '@/modules/plants/models/plant.model';

const plantsService = Object.create(PlantsService.prototype);
const plantsBusiness = Object.create(PlantsBusiness.prototype);
plantsBusiness.plantsService = plantsService;
plantsBusiness.formatResponse = PlantsBusiness.prototype['formatResponse'];
plantsBusiness.checkOwnership = PlantsBusiness.prototype['checkOwnership'];

describe('PlantsBusiness tests', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve buscar planta por id', async () => {
    const mockPlant = {
      id: '1',
      userId: 'user1',
      name: 'Rosa'
    };

    jest.spyOn(Plant, 'findByPk').mockResolvedValue(mockPlant as any);

    const result = await plantsBusiness.getPlantById('user1', 'USER', '1');

    expect(result.name).toBe('Rosa');
  });

  it('deve falhar ao buscar planta de outro usuario', async () => {
    const mockPlant = {
      id: '1',
      userId: 'user2',
      name: 'Rosa'
    };

    jest.spyOn(Plant, 'findByPk').mockResolvedValue(mockPlant as any);

    await expect(plantsBusiness.getPlantById('user1', 'USER', '1')).rejects.toThrow('Você não tem permissão para acessar ou modificar esta planta.');
  });

  it('deve listar plantas paginadas', async () => {
    const mockPlants = [
      { id: '1', name: 'Rosa' },
      { id: '2', name: 'Margarida' }
    ];

    jest.spyOn(Plant, 'findAndCountAll').mockResolvedValue({ rows: mockPlants, count: 2 } as any);

    const params = { page: 1, limit: 10 };

    const result = await plantsBusiness.getPlantsPaginated('user1', 'USER', params);

    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(2);
  });
});
