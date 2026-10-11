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

import { SubscriptionActionsBar } from './SubscriptionActionsBar';
import type { Subscription } from '../../../../types/subscription';

jest.mock('@gravitee/graphene-core', () => ({
    Alert: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    AlertDescription: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Button: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
        <button type="button" onClick={onClick}>
            {children}
        </button>
    ),
    Dialog: ({ open, children }: { open?: boolean; children?: ReactNode }) => (open ? <div role="dialog">{children}</div> : null),
    DialogContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    DialogFooter: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
    Label: ({ children, htmlFor }: { children?: ReactNode; htmlFor?: string }) => <label htmlFor={htmlFor}>{children}</label>,
    Select: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectTrigger: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectValue: () => null,
    Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

jest.mock('@gravitee/graphene-core/icons', () => new Proxy({}, { get: () => () => null }));

jest.mock('../../../../../../shared/notify', () => ({
    notify: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../../hooks/useSubscriptions', () => ({
    useApiPlans: () => ({ data: [] }),
}));

jest.mock('../../../../hooks/useSubscriptionActions', () => ({
    useApproveSubscription: () => ({ mutate: jest.fn(), isPending: false, reset: jest.fn() }),
    useRejectSubscription: () => ({ mutate: jest.fn(), isPending: false, reset: jest.fn() }),
    usePauseSubscription: () => ({ mutate: jest.fn(), isPending: false }),
    useResumeSubscription: () => ({ mutate: jest.fn(), isPending: false }),
    useResumeFailedSubscription: () => ({ mutate: jest.fn(), isPending: false }),
    useCloseSubscription: () => ({ mutate: jest.fn(), isPending: false }),
    useTransferSubscription: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateSubscriptionEndDate: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('./SubscriptionApproveDialog', () => ({
    SubscriptionApproveDialog: () => null,
}));

const PAUSED_SUBSCRIPTION: Subscription = {
    id: 'sub-1',
    status: 'PAUSED',
    plan: { id: 'plan-1', name: 'API Key', security: { type: 'API_KEY' } },
    application: { id: 'app-1', name: 'App', apiKeyMode: 'EXCLUSIVE' },
};

describe('SubscriptionActionsBar', () => {
    it('shows Transfer, Change end date, and Resume on a paused non-federated subscription', () => {
        render(
            <SubscriptionActionsBar
                ctx={{ type: 'api', entityId: 'api-1' }}
                subscription={PAUSED_SUBSCRIPTION}
                canUpdate
                canDelete
                isFederated={false}
            />,
        );

        expect(screen.getByRole('button', { name: /transfer/i })).not.toBeNull();
        expect(screen.getByRole('button', { name: /change end date/i })).not.toBeNull();
        expect(screen.getByRole('button', { name: /^resume$/i })).not.toBeNull();
        expect(screen.queryByRole('button', { name: /^pause$/i })).toBeNull();
    });
});
