const { Router } = require('express');

const auth = require('../middleware/auth');
const paginated = require('../middleware/paginated');
const { generateHash } = require('../utils/hash');

class BaseController {
  constructor(path, model) {
    this.path = path;
    this.model = model;
  }

  /**
   * Listar todos os registros paginados
   * @param {object} req
   * @param {object} res
   *
   * @returns Promise<Array>
   */
  async index(req, res) {
    try {
      return res.json(res.paginatedResults);
    } catch (error) {
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  /**
   * Listar um registro
   * @param {object} req
   * @param {object} res
   *
   * @returns Promise<Object>
   */
  async show(req, res) {
    const { id } = req.params;
    const { query } = req;

    try {
      const response = await this.model.findByPk(id, query);

      return res.json(response);
    } catch (error) {
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  /**
   * Criar um registro
   * @param {object} req
   * @param {object} res
   *
   * @returns Promise<Object>
   */
  async store(req, res) {
    if (req.body.password) {
      req.body.password = await generateHash(req.body.password);
    }
    try {
      const response = await this.model.create(req.body);

      return res.json(response);
    } catch (error) {
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  /**
   * Alterar um registro
   * @param {object} req
   * @param {object} res
   *
   * @returns Promise<Object>
   */
  async update(req, res) {
    const { id } = req.params;
    const { body, query } = req;
    try {
      await this.model.update(body, {
        where: { id },
        ...query,
      },
      { returning: true });

      const response = await this.model.findByPk(id, query);

      return res.json(response);
    } catch (error) {
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  /**
   * Romevor um registro
   * @param {object} req
   * @param {object} res
   *
   * @returns Promise<Boolean>
   */
  async destroy(req, res) {
    const { id } = req.params;
    try {
      await this.model.destroy({
        where: {
          id,
        },
      });

      return res.sendStatus(200);
    } catch (error) {
      return res.status(500).json({
        message: error.toString(),
      });
    }
  }

  routes() {
    const routes = Router();

    routes.get(`/${this.path}`, paginated(this.model), this.index.bind(this));
    routes.get(`/${this.path}/:id`, this.show.bind(this));
    routes.post(`/${this.path}`, this.store.bind(this));
    routes.put(`/${this.path}/:id`, this.update.bind(this));
    routes.delete(`/${this.path}/:id`, this.destroy.bind(this));

    return routes;
  }
}

module.exports = BaseController;
