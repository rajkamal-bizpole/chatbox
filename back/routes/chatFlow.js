// routes/chatFlows.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper function to safely parse JSON
const safeJsonParse = (str, defaultValue = {}) => {
  if (!str) return defaultValue;
  if (typeof str === 'object') return str; // Already parsed
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Invalid JSON, returning default:', str);
    return defaultValue;
  }
};

// Helper function to safely stringify JSON
const safeJsonStringify = (obj, defaultValue = '{}') => {
  if (!obj) return defaultValue;
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Invalid object for JSON stringify, returning default:', obj);
    return defaultValue;
  }
};

// GET /api/chat/flows - List all flows
router.get('/flows', async (req, res) => {
    try {
        const [flows] = await db.execute(`
            SELECT 
                id, 
                name, 
                description, 
                is_active, 
                created_at,
                updated_at,
                (SELECT COUNT(*) FROM chat_steps WHERE chat_steps.flow_id = chat_flows.id) as step_count
            FROM chat_flows 
            ORDER BY created_at DESC
        `);

        res.json(flows);
    } catch (error) {
        console.error('Error fetching flows:', error);
        res.status(500).json({ error: 'Failed to fetch chat flows' });
    }
});

// GET /api/chat/flows/active - Get active flow for customers
router.get('/flows/active', async (req, res) => {
    try {
        const [flows] = await db.execute(`
            SELECT 
                id, 
                name, 
                description, 
                is_active, 
                created_at
            FROM chat_flows 
            WHERE is_active = true 
            ORDER BY updated_at DESC 
            LIMIT 1
        `);

        if (flows.length === 0) {
            return res.status(404).json({ error: 'No active chat flow found' });
        }

        const flow = flows[0];

        // Get steps for this flow
        const [steps] = await db.execute(`
            SELECT 
                id,
                step_key,
                step_type,
                message_text,
                options,
                validation_rules,
                next_step_map,
                api_config,
                is_initial,
                sort_order
            FROM chat_steps 
            WHERE flow_id = ? 
            ORDER BY sort_order ASC
        `, [flow.id]);

        // Parse JSON fields safely
        const parsedSteps = steps.map(step => ({
            ...step,
            options: safeJsonParse(step.options, []),
            validation_rules: safeJsonParse(step.validation_rules, {}),
            next_step_map: safeJsonParse(step.next_step_map, {}),
            api_config: safeJsonParse(step.api_config, {})
        }));

        res.json({
            ...flow,
            steps: parsedSteps
        });
    } catch (error) {
        console.error('Error fetching active flow:', error);
        res.status(500).json({ error: 'Failed to fetch active chat flow' });
    }
});

// GET /api/chat/flows/:id - Get specific flow with steps
router.get('/flows/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [flows] = await db.execute(`
            SELECT 
                id, 
                name, 
                description, 
                is_active, 
                created_at,
                updated_at
            FROM chat_flows 
            WHERE id = ?
        `, [id]);

        if (flows.length === 0) {
            return res.status(404).json({ error: 'Chat flow not found' });
        }

        const flow = flows[0];

        // Get steps for this flow
        const [steps] = await db.execute(`
            SELECT 
                id,
                step_key,
                step_type,
                message_text,
                options,
                validation_rules,
                next_step_map,
                api_config,
                is_initial,
                sort_order
            FROM chat_steps 
            WHERE flow_id = ? 
            ORDER BY sort_order ASC
        `, [id]);

        // Parse JSON fields safely
        const parsedSteps = steps.map(step => ({
            ...step,
            options: safeJsonParse(step.options, []),
            validation_rules: safeJsonParse(step.validation_rules, {}),
            next_step_map: safeJsonParse(step.next_step_map, {}),
            api_config: safeJsonParse(step.api_config, {})
        }));

        res.json({
            ...flow,
            steps: parsedSteps
        });
    } catch (error) {
        console.error('Error fetching flow:', error);
        res.status(500).json({ error: 'Failed to fetch chat flow' });
    }
});

// POST /api/chat/flows - Create new flow
router.post('/flows', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { name, description, is_active = false, steps = [] } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Flow name is required' });
        }

        // Insert flow
        const [flowResult] = await connection.execute(`
            INSERT INTO chat_flows (name, description, is_active) 
            VALUES (?, ?, ?)
        `, [name.trim(), description || '', is_active]);

        const flowId = flowResult.insertId;

        // Insert steps
        if (steps.length > 0) {
            for (const [index, step] of steps.entries()) {
                // Validate step data
                if (!step.step_key || !step.step_key.trim()) {
                    throw new Error(`Step ${index} is missing step_key`);
                }
                if (!step.message_text || !step.message_text.trim()) {
                    throw new Error(`Step ${step.step_key} is missing message_text`);
                }

                await connection.execute(`
                    INSERT INTO chat_steps (
                        flow_id, step_key, step_type, message_text, options, 
                        validation_rules, next_step_map, api_config, is_initial, sort_order
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    flowId,
                    step.step_key.trim(),
                    step.step_type || 'message',
                    step.message_text.trim(),
                    safeJsonStringify(step.options || []),
                    safeJsonStringify(step.validation_rules || {}),
                    safeJsonStringify(step.next_step_map || {}),
                    safeJsonStringify(step.api_config || {}),
                    step.is_initial || false,
                    step.sort_order ?? index

                ]);
            }
        }

        await connection.commit();

        // Fetch created flow with steps
        const [flows] = await db.execute(`
            SELECT 
                id, 
                name, 
                description, 
                is_active, 
                created_at,
                updated_at
            FROM chat_flows 
            WHERE id = ?
        `, [flowId]);

        const [stepsResult] = await db.execute(`
            SELECT 
                id,
                step_key,
                step_type,
                message_text,
                options,
                validation_rules,
                next_step_map,
                api_config,
                is_initial,
                sort_order
            FROM chat_steps 
            WHERE flow_id = ? 
            ORDER BY sort_order ASC
        `, [flowId]);

        // Parse JSON fields safely
        const parsedSteps = stepsResult.map(step => ({
            ...step,
            options: safeJsonParse(step.options, []),
            validation_rules: safeJsonParse(step.validation_rules, {}),
            next_step_map: safeJsonParse(step.next_step_map, {}),
            api_config: safeJsonParse(step.api_config, {})
        }));

        res.status(201).json({
            ...flows[0],
            steps: parsedSteps
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error creating flow:', error);
        res.status(500).json({ error: error.message || 'Failed to create chat flow' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// PUT /api/chat/flows/:id - Update flow
router.put('/flows/:id', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { id } = req.params;
        const { name, description, is_active, steps = [] } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Flow name is required' });
        }

        // Update flow
        await connection.execute(`
            UPDATE chat_flows 
            SET name = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [name.trim(), description || '', is_active, id]);

        // Delete existing steps
        await connection.execute('DELETE FROM chat_steps WHERE flow_id = ?', [id]);

        // Insert updated steps
        if (steps.length > 0) {
            for (const [index, step] of steps.entries()) {
                // Validate step data
                if (!step.step_key || !step.step_key.trim()) {
                    throw new Error(`Step ${index} is missing step_key`);
                }
                if (!step.message_text || !step.message_text.trim()) {
                    throw new Error(`Step ${step.step_key} is missing message_text`);
                }

                await connection.execute(`
                    INSERT INTO chat_steps (
                        flow_id, step_key, step_type, message_text, options, 
                        validation_rules, next_step_map, api_config, is_initial, sort_order
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    id,
                    step.step_key.trim(),
                    step.step_type || 'message',
                    step.message_text.trim(),
                    safeJsonStringify(step.options || []),
                    safeJsonStringify(step.validation_rules || {}),
                    safeJsonStringify(step.next_step_map || {}),
                    safeJsonStringify(step.api_config || {}),
                    step.is_initial || false,
                    step.sort_order || index
                ]);
            }
        }

        await connection.commit();

        // Fetch updated flow with steps
        const [flows] = await db.execute(`
            SELECT 
                id, 
                name, 
                description, 
                is_active, 
                created_at,
                updated_at
            FROM chat_flows 
            WHERE id = ?
        `, [id]);

        const [stepsResult] = await db.execute(`
            SELECT 
                id,
                step_key,
                step_type,
                message_text,
                options,
                validation_rules,
                next_step_map,
                api_config,
                is_initial,
                sort_order
            FROM chat_steps 
            WHERE flow_id = ? 
            ORDER BY sort_order ASC
        `, [id]);

        // Parse JSON fields safely
        const parsedSteps = stepsResult.map(step => ({
            ...step,
            options: safeJsonParse(step.options, []),
            validation_rules: safeJsonParse(step.validation_rules, {}),
            next_step_map: safeJsonParse(step.next_step_map, {}),
            api_config: safeJsonParse(step.api_config, {})
        }));

        res.json({
            ...flows[0],
            steps: parsedSteps
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error updating flow:', error);
        res.status(500).json({ error: error.message || 'Failed to update chat flow' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// DELETE /api/chat/flows/:id - Delete flow
router.delete('/flows/:id', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { id } = req.params;

        // Delete steps first (foreign key constraint)
        await connection.execute('DELETE FROM chat_steps WHERE flow_id = ?', [id]);

        // Delete flow
        const [result] = await connection.execute('DELETE FROM chat_flows WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Chat flow not found' });
        }

        await connection.commit();

        res.json({ message: 'Chat flow deleted successfully' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error deleting flow:', error);
        res.status(500).json({ error: 'Failed to delete chat flow' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// PATCH /api/chat/flows/:id/status - Toggle flow status
router.patch('/flows/:id/status', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const { id } = req.params;
        const { is_active } = req.body;

        // If activating this flow, deactivate all others
        if (is_active) {
            await connection.execute('UPDATE chat_flows SET is_active = false WHERE is_active = true');
        }

        const [result] = await connection.execute(`
            UPDATE chat_flows 
            SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [is_active, id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Chat flow not found' });
        }

        await connection.commit();

        res.json({ 
            message: `Flow ${is_active ? 'activated' : 'deactivated'} successfully`,
            is_active 
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error updating flow status:', error);
        res.status(500).json({ error: 'Failed to update flow status' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// POST /api/chat/execute-step - Execute step with API call (for customer chat)
router.post('/execute-step', async (req, res) => {
    try {
        const { step_key, user_input, user_data, step_data } = req.body;

        const response = {
            success: true,
            user_data: {
                ...user_data,
                [step_key]: user_input
            },
            next_step: null,
            message: "Step executed successfully"
        };

        res.json(response);

    } catch (error) {
        console.error('Error executing step:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to execute step',
            next_step: 'error' 
        });
    }
});

module.exports = router;