import { PlantsService } from "./plants.service";
import { PlantsBusiness } from "./plants.business";
import { PlantsController } from "./plants.controller";

const plantsService = new PlantsService();
const plantsBusiness = new PlantsBusiness(plantsService);
export const plantsController = new PlantsController(plantsBusiness);
