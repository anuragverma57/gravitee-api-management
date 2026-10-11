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
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SubscriptionApproveDialog } from './SubscriptionApproveDialog';
import { dateInputToOffsetDateTime } from '../../../../utils/dateInputToOffsetDateTime';

jest.mock('@gravitee/graphene-core', () => ({
    Button: ({ children, onClick, disabled }: { children?: ReactNode; onClick?: () => void; disabled?: boolean }) => (
        <button type="button" onClick={onClick} disabled={disabled}>
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
    Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

jest.mock('@gravitee/graphene-core/icons', () => new Proxy({}, { get: () => () => null }));

jest.mock('../../../../hooks/usePlanSecuritySettings', () => ({
    useCustomApiKeyEnabled: jest.fn(() => true),
}));

describe('SubscriptionApproveDialog', () => {
    it('hides start date, end date, and custom API key for a federated subscription', () => {
        render(
            <SubscriptionApproveDialog
                open
                isApiKeyPlan
                isSharedApiKeyMode={false}
                isFederated
                isPending={false}
                onConfirm={jest.fn()}
                onClose={jest.fn()}
            />,
        );

        expect(screen.queryByLabelText(/starting date/i)).toBeNull();
        expect(screen.queryByLabelText(/ending date/i)).toBeNull();
        expect(screen.queryByLabelText(/custom api key/i)).toBeNull();
        expect(screen.getByLabelText(/message to subscriber/i)).not.toBeNull();
    });

    it('sends approve dates as noon-UTC OffsetDateTime strings', () => {
        const onConfirm = jest.fn();
        render(
            <SubscriptionApproveDialog
                open
                isApiKeyPlan={false}
                isFederated={false}
                isPending={false}
                onConfirm={onConfirm}
                onClose={jest.fn()}
            />,
        );

        fireEvent.change(screen.getByLabelText(/starting date/i), { target: { value: '2026-10-31' } });
        fireEvent.change(screen.getByLabelText(/ending date/i), { target: { value: '2026-11-30' } });
        fireEvent.click(screen.getByRole('button', { name: /^approve$/i }));

        expect(onConfirm).toHaveBeenCalledWith({
            startingAt: dateInputToOffsetDateTime('2026-10-31'),
            endingAt: dateInputToOffsetDateTime('2026-11-30'),
        });
    });
});
