/*
 * Copyright © 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SubscriptionApiKeysCard } from './SubscriptionApiKeysCard';
import { useApiKeyList } from '../../../../hooks/useSubscriptionApiKeys';
import type { Subscription } from '../../../../types/subscription';

jest.mock('@gravitee/graphene-core', () => ({
    Button: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
        <button type="button" onClick={onClick}>
            {children}
        </button>
    ),
    Card: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    CardContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    CardHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    DataTablePagination: () => null,
    Dialog: ({ open, children }: { open?: boolean; children?: ReactNode }) => (open ? <div role="dialog">{children}</div> : null),
    DialogContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    DialogFooter: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
    Label: ({ children, htmlFor }: { children?: ReactNode; htmlFor?: string }) => <label htmlFor={htmlFor}>{children}</label>,
    Skeleton: () => <div aria-busy="true" />,
    Table: ({ children }: { children?: ReactNode }) => <table>{children}</table>,
    TableBody: ({ children }: { children?: ReactNode }) => <tbody>{children}</tbody>,
    TableCell: ({ children }: { children?: ReactNode }) => <td>{children}</td>,
    TableHead: ({ children }: { children?: ReactNode }) => <th>{children}</th>,
    TableHeader: ({ children }: { children?: ReactNode }) => <thead>{children}</thead>,
    TableRow: ({ children }: { children?: ReactNode }) => <tr>{children}</tr>,
    Tooltip: ({ children }: { children?: ReactNode }) => <>{children}</>,
    TooltipContent: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
    TooltipTrigger: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

jest.mock('@gravitee/graphene-core/icons', () => new Proxy({}, { get: () => () => null }));

jest.mock('../../../../../../shared/notify', () => ({
    notify: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../../hooks/usePlanSecuritySettings', () => ({
    useCustomApiKeyEnabled: jest.fn(() => false),
}));

jest.mock('../../../../hooks/useSubscriptionApiKeys', () => ({
    useApiKeyList: jest.fn(),
    useExpireApiKey: () => ({ mutate: jest.fn(), isPending: false }),
    useReactivateApiKey: () => ({ mutate: jest.fn(), isPending: false }),
    useRenewApiKey: () => ({ mutate: jest.fn(), isPending: false }),
    useRevokeApiKey: () => ({ mutate: jest.fn(), isPending: false }),
}));

const mockUseApiKeyList = useApiKeyList as jest.Mock;

const ACCEPTED_EXCLUSIVE: Subscription = {
    id: 'sub-1',
    status: 'ACCEPTED',
    plan: { id: 'plan-1', name: 'API Key', security: { type: 'API_KEY' } },
    application: { id: 'app-1', name: 'App', apiKeyMode: 'EXCLUSIVE' },
};

const ACCEPTED_SHARED: Subscription = {
    ...ACCEPTED_EXCLUSIVE,
    application: { id: 'app-1', name: 'App', apiKeyMode: 'SHARED' },
};

describe('SubscriptionApiKeysCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows Reactivate for a revoked key', () => {
        mockUseApiKeyList.mockReturnValue({
            data: {
                data: [{ id: 'key-1', key: 'abc', revoked: true, expired: false }],
                pagination: { totalCount: 1, pageIndex: 1, pageSize: 5 },
            },
            isLoading: false,
        });

        render(
            <SubscriptionApiKeysCard
                ctx={{ type: 'api', entityId: 'api-1' }}
                subscription={ACCEPTED_EXCLUSIVE}
                canUpdate
                isFederated={false}
            />,
        );

        expect(screen.getByRole('button', { name: /reactivate key/i })).not.toBeNull();
    });

    it('hides Renew when the application uses a shared API key', () => {
        mockUseApiKeyList.mockReturnValue({
            data: {
                data: [{ id: 'key-1', key: 'abc', revoked: false, expired: false }],
                pagination: { totalCount: 1, pageIndex: 1, pageSize: 5 },
            },
            isLoading: false,
        });

        render(
            <SubscriptionApiKeysCard
                ctx={{ type: 'api', entityId: 'api-1' }}
                subscription={ACCEPTED_SHARED}
                canUpdate
                isFederated={false}
            />,
        );

        expect(screen.queryByRole('button', { name: /^renew$/i })).toBeNull();
    });
});
