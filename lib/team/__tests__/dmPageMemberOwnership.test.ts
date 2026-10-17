/** Team DM page: fake session and SQL only. Verifies authorization before thread access. */
import type {ReactElement} from 'react';
const mockSession=jest.fn();
const mockQuery=jest.fn();
const mockThreads=jest.fn();
const mockRedirect=jest.fn(()=>{throw Error('NEXT_REDIRECT');});
jest.mock('next/navigation',()=>({redirect:(...a:unknown[])=>mockRedirect(...a)}));
jest.mock('@/lib/auth/serverSessions',()=>({getCurrentSession:()=>mockSession()}));
jest.mock('@/lib/db/postgres',()=>({query:(...a:unknown[])=>mockQuery(...a)}));
jest.mock('@/lib/team/DMService',()=>({listDMThreads:(...a:unknown[])=>mockThreads(...a)}));
jest.mock('@/components/team/DMView',()=>({DMView:()=>null}));
import DMPage from '@/app/team/(shell)/dm/[dmId]/page';
const memberId='11111111-1111-4111-8111-111111111111';
const dmId='22222222-2222-4222-8222-222222222222';
const teamId='33333333-3333-4333-8333-333333333333';
const params={params:Promise.resolve({dmId})};
beforeEach(()=>{jest.clearAllMocks();mockSession.mockResolvedValue(null);mockQuery.mockResolvedValue({rows:[]});mockThreads.mockResolvedValue([]);});
describe('DM page verified membership',()=>{
 it('no validated session -> redirect; never query by asserted member cookie',async()=>{
  await expect(DMPage(params)).rejects.toThrow('NEXT_REDIRECT');
  expect(mockRedirect).toHaveBeenCalled();
  expect(mockQuery).not.toHaveBeenCalled();
  expect(mockThreads).not.toHaveBeenCalled();
 });
 it('authenticated but not member of the thread or Co-Lab -> no roster read',async()=>{
  mockSession.mockResolvedValue({memberId});
  const result=await DMPage(params) as ReactElement;
  expect(result.props.children).toBe('DM thread not found.');
  expect(mockThreads).not.toHaveBeenCalled();
  const [sql,args]=mockQuery.mock.calls[0];
  expect(sql).toContain('JOIN team_dm_members');
  expect(sql).toContain('JOIN studio_team_members');
  expect(sql).toContain('dm.hidden_at IS NULL');
  expect(args).toEqual([dmId,memberId]);
 });
 it('member in exact thread and Co-Lab loads only that team roster',async()=>{
  mockSession.mockResolvedValue({memberId});
  mockQuery.mockResolvedValueOnce({rows:[{team_id:teamId}]});
  const thread={id:dmId,members:[],createdAt:'2026-10-17',lastMessage:null,lastMessageAt:null,unreadCount:0};
  mockThreads.mockResolvedValueOnce([thread]);
  const result=await DMPage(params) as ReactElement;
  expect(mockThreads).toHaveBeenCalledWith(memberId,teamId);
  expect(result.props.dmThread).toBe(thread);
  expect(result.props.currentMemberId).toBe(memberId);
 });
 it('owned Co-Lab cannot display another member thread',async()=>{
  mockSession.mockResolvedValue({memberId});
  mockQuery.mockResolvedValueOnce({rows:[{team_id:teamId}]});
  mockThreads.mockResolvedValueOnce([]);
  const result=await DMPage(params) as ReactElement;
  expect(result.props.children?.[1]?.props?.children ?? String(result.props.children)).toBeDefined();
  expect(mockThreads).toHaveBeenCalledWith(memberId,teamId);
 });
});
