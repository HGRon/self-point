import Input from '../input';
import { InputTypeEnum } from '../input/models/input-type.enum';
import Checkbox from '../checkbox';
import Button from '../button';
import { ButtonTypeEnum } from '../button/models/button-type.enum';
import { useEffect, useState } from 'react';
import { UserConfig } from './models/user-config';
import { StorageService } from '../../services/storage/storage-service';
import { notify } from '../toast/services/notify';
import { ToastTypeEnum } from '../toast/models/toast-type.enum';
import { StorageKeyEnum } from '../../services/storage/models/storage-key.enum';

interface ModalConfigProps {
  isOpen: boolean;
  forceClose?: () => void;
}

const storage = new StorageService();

function ModalConfig({ isOpen, forceClose }: ModalConfigProps) {
  const [formData, setFormData] = useState(factoryConfig());

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const config = await storage.get<UserConfig>(StorageKeyEnum.USER_CONFIG);

      if (!config)
        return;

      setFormData({
        username: config.username,
        password: config.password,
        latitude: config.latitude,
        longitude: config.longitude,
        address: config.address,
        url: config.url,
        automatic: config.automatic || false,
        time: config.time
      });
    };

    fetchData().then();
  }, []);


  const handleChange = (key: string, value: string | number | boolean) => {
    setFormData({
      ...formData,
      [key]: value
    });
  };

  const saveConfig = async () => {
    const config: UserConfig = {
      ...formData,
    }

    try {
      await storage.set(StorageKeyEnum.USER_CONFIG, config);
      notify('Configurações salvas com sucesso', ToastTypeEnum.SUCCESS);
      closeModal()
    } catch (error) {
      notify('Erro ao salvar configurações!', ToastTypeEnum.ERROR);
    }
  }

  const outsideClose = (event: any) => {
    if (event.target.id === 'modal-config')
      closeModal();
  }

  const closeModal = () => {
    if (forceClose)
      forceClose();
  }

  return (
    <dialog open={ isOpen } id="modal-config" onClick={ outsideClose } className="modal">
      <div className="modal__container">
        <header>Configurações 🔩</header>

        <div className="modal__container__geolocation">
          <Input name="latitude"
                 placeholder="Latitude"
                 onChange={ handleChange }
                 value={ formData.latitude }
                 type={ InputTypeEnum.TEXT } />
          <Input name="longitude"
                 placeholder="Longitude"
                 onChange={ handleChange }
                 value={ formData.longitude }
                 type={ InputTypeEnum.TEXT } />
        </div>

        <div className="modal__container__adress">
          <Input name="address" placeholder="Endereço"
                 onChange={ handleChange }
                 value={ formData.address }
                 type={ InputTypeEnum.TEXT } />
          <Input name="url"
                 placeholder="URL"
                 onChange={ handleChange }
                 value={ formData.url }
                 type={ InputTypeEnum.URL } />
        </div>

        <div className="modal__container__point-config">
          <div className="modal__container__point-config__column">
            <span>Dados de acesso 🔐</span>

            <Input name="username"
                   placeholder="Nome de usuário"
                   onChange={ handleChange }
                   value={ formData.username }
                   type={ InputTypeEnum.TEXT } />
            <Input name="password"
                   placeholder="Senha"
                   onChange={ handleChange }
                   value={ formData.password }
                   type={ InputTypeEnum.PASSWORD } />
          </div>

          <div className="modal__container__point-config__column">
            <span>Rotinas 🕟
              <Checkbox name="automatic"
                        placeholder="Automatico ?"
                        onChange={ handleChange }
                        value={ formData.automatic } />
            </span>

            <Input name="time"
                   placeholder="Primeiro horario"
                   onChange={ handleChange }
                   value={ formData.time }
                   type={ InputTypeEnum.TIME } />
          </div>
        </div>

        <div className="modal__container__button">
          <Button onClick={ saveConfig } type={ ButtonTypeEnum.CONFIRM }>Confirmar</Button>
        </div>
      </div>
    </dialog>
  );
}

export default ModalConfig;

function factoryConfig(): UserConfig {
  return {
    username: '',
    password: '',
    latitude: '',
    longitude: '',
    address: '',
    url: '',
    automatic: false,
    time: '',
  }
}
