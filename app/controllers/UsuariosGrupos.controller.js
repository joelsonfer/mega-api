const {getConnection} = require('../database/Oracle.database');

async function listarUsuariosGrupos(req, res) {
    const {page = 1, limit = 10, usuarios: usuarios, grupos: grupos} = req.query;
    const offset = (page - 1) * limit;
    let connection;

    try {
        let where = '';
        const binds = {
            offset: offset + 1,
            limit: offset + parseInt(limit),
        };
        if (usuarios) {
            if (Array.isArray(usuarios) && usuarios.length > 0) {
                where += ` and glo_u.GRU_ST_NOME in (${usuarios.map(user => `'${user}'`).join(',')}) `
            } else {
                where += ' and glo_u.GRU_ST_NOME in (:usuarios) '
                binds.usuarios = usuarios
            }
        }
        if (grupos) {
            if (Array.isArray(grupos) && grupos.length > 0) {
                where += ` and g.GRU_IN_CODIGO in (${grupos.join(',')}) `
            } else {
                where += ' and g.GRU_IN_CODIGO in (:grupos) '
                binds.grupos = grupos
            }
        }

        const sql = `
            SELECT id_grupo, nome_grupo, id_usuario, nome_usuario
            FROM (select g.GRU_IN_CODIGO   as id_grupo,
                         g.GRU_ST_NOME     as nome_grupo,
                         USU_GRU_IN_CODIGO as id_usuario,
                         glo_u.GRU_ST_NOME as nome_usuario,
                         ROWNUM            as sequencia
                  from EST_RESPONSAVEIS r
                           join est_grupos g on r.GRU_IN_CODIGO = g.GRU_IN_CODIGO
                           join EST_GRUPO_USUARIO gu on r.USU_GRU_IN_CODIGO = gu.GRU_IN_CODIGO
                           join GLO_GRUPO_USUARIO glo_u on gu.GRU_IN_CODIGO = glo_u.GRU_IN_CODIGO
                  where gu.USU_ST_COMPRADOR = 'S'
                    and glo_u.GRU_CH_STATUS = 'A'
                      ${where}
                  order by id_usuario, id_grupo)
            WHERE sequencia BETWEEN :offset AND :limit
        `;

        connection = await getConnection();
        const result = await connection.execute(sql, binds);

        res.json({
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.rows.length,
            data: result.rows
        });

    } catch (err) {
        console.error('Erro ao listar grupos do usuário:', err);
        res.status(500).json({erro: 'Erro ao consultar grupos do usuário'});
    } finally {
        if (connection) await connection.close();
    }
}

module.exports = {listarUsuariosGrupos};
