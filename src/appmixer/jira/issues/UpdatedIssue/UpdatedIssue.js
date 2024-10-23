'use strict';
const commons = require('../../jira-commons');

/**
 * Component which triggers whenever an issue is updated.
 * @extends {Component}
 */
module.exports = {

    async tick(context) {

        const { profileInfo: { apiUrl }, auth } = context;
        const { project } = context.properties;

        const now = Date.now();
        const nowMinusMinute = now - 60000;
        const updatedMinusSecond = now - 61000;

        const params = {
            maxResults: 1000,
            jql: `updated >= ${nowMinusMinute} AND created < ${updatedMinusSecond}`
        };

        if (project) {
            params.jql += ` AND project = "${project}"`;
        }

        params.jql += ' ORDER BY updated';

        const issues = await commons.getAPINoPagination({
            endpoint: `${apiUrl}search`,
            credentials: auth,
            key: 'issues',
            params
        });
        context.log({ stage: 'searchUpdatedIssueResponse', issues });


        if (Array.isArray(issues) && issues.length > 0) {
            const issuesArr = issues.reverse();
            for (const issue of issuesArr) {
                await context.sendJson(issue, 'issue');
            }
        }
    }
};
