/** Optional Capacitor bridges: no native hardware, permissions, credentials or contacts. */
const mockNative=jest.fn(()=>false);
const mockHasPlugin=jest.fn(()=>false);
const mockRegister=jest.fn();
jest.mock('@capacitor/core',()=>({
 Capacitor:{isNativePlatform:()=>mockNative(),isPluginAvailable:(name:string)=>mockHasPlugin(name)},
 registerPlugin:(name:string)=>mockRegister(name),
}));
import {nativeBiometry} from '@/lib/auth/nativeBiometry';
import {DeviceContactsService} from '@/lib/contacts/DeviceContactsService';
beforeEach(()=>{jest.clearAllMocks();mockNative.mockReturnValue(false);mockHasPlugin.mockReturnValue(false);});
describe('optional native plugins fail closed',()=>{
 it('ordinary web has no native biometric or contacts permissions',async()=>{
  expect((await nativeBiometry.checkAvailability()).available).toBe(false);
  expect(await DeviceContactsService.isAvailable()).toBe(false);
  expect(mockRegister).not.toHaveBeenCalled();
 });
 it('native without registered biometric plugin never reaches Keychain',async()=>{
  mockNative.mockReturnValue(true);
  const availability=await nativeBiometry.checkAvailability();
  expect(availability).toMatchObject({available:false,biometryType:'none'});
  expect(await nativeBiometry.hasStoredCredentials()).toBe(false);
  expect(await nativeBiometry.storeCredentials({memberId:'fictional',username:'fictional'})).toBe(false);
  expect((await nativeBiometry.authenticate()).success).toBe(false);
  expect(await nativeBiometry.deleteCredentials()).toBe(false);
  expect(mockHasPlugin).toHaveBeenCalledWith('NativeBiometric');
  expect(mockRegister).not.toHaveBeenCalled();
 });
 it('native contacts absent: no permission prompt, contact read or plugin load',async()=>{
  mockNative.mockReturnValue(true);
  // Mock only window presence; no real browser/native runtime or contacts.
  const prior=(globalThis as {window?:unknown}).window;
  Object.defineProperty(globalThis,'window',{configurable:true,writable:true,value:{}});
  try {
   expect(await DeviceContactsService.isAvailable()).toBe(false);
   expect(await DeviceContactsService.checkPermission()).toBe('denied');
   expect(await DeviceContactsService.requestPermission()).toBe('denied');
   await expect(DeviceContactsService.fetchContacts()).rejects.toThrow('Contacts plugin not available');
   expect(mockHasPlugin).toHaveBeenCalledWith('Contacts');
   expect(mockRegister).not.toHaveBeenCalled();
  } finally {
   if(prior===undefined)delete (globalThis as {window?:unknown}).window;
   else Object.defineProperty(globalThis,'window',{configurable:true,writable:true,value:prior});
  }
 });
});
